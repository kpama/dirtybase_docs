---
outline: deep
---

# Authorization

Authorization answers whether the authenticated actor may perform an action. Dirtybase provides two complementary mechanisms:

- **Permissions** describe actions assigned to roles and actors.
- **Gates** evaluate application-specific abilities in code.

Authentication must resolve an actor before actor permissions can be checked. See [Authentication](/docs/v1/authentication) for identifying the actor and [Context](/docs/v1/context) for accessing it in a request.

## Permissions

Permissions are named actions such as `posts:create` or `posts:delete`. Roles collect permissions, and actors can have roles and permissions loaded into their auth context.

```rust
let permission = Permission::new("posts:create", "Create posts");
let mut permissions = PermissionManager::new();
permissions.add(permission);

let can_create = permissions.can("posts:create", &context).await;
```

Permission names are hierarchical and use `:` as the separator. Wildcards can grant a whole area:

```text
posts:*       # Any posts action
*             # Any action
posts:create:42
```

Use `all` when every permission is required and `any` when at least one is sufficient:

```rust
let can_publish = permissions
    .all(&["posts:update", "posts:publish"], &context)
    .await;

let can_moderate = permissions
    .any(&["posts:update", "posts:delete"], &context)
    .await;
```

## Roles

Roles group permissions for assignment to actors. Dirtybase's built-in role model includes a name, label, description, permissions, and actors:

```rust
let editor = Role::new("editor", "Editor")
    .set_description("Can manage editorial content");
```

Load an actor with its roles and permissions when the authorization decision needs them. Keep role and permission names stable because they are referenced by route middleware and application code.

## Gates

Use a gate when authorization depends on application logic rather than a static permission assignment. Define an ability by name:

```rust
Gate::define("posts:update", |actor: Actor| async move {
    Some(GateResponse::from(!actor.is_guest()))
})
.await;
```

The gate handler is resolved through Dirtybase's context container, so it can receive context resources and application values. A gate returns an allow or deny response.

Evaluate a gate from a context:

```rust
let gate = Gate::from(&context);

if gate.allows("posts:update").await {
    // Continue with the operation.
}
```

Use `allows`, `can`, `cannot`, `all`, and `any` for boolean checks. Use `response` when the caller needs the full `GateResponse`, including a custom HTTP response.

## Gate middleware

Dirtybase registers `gate` and `can` as aliases for the gate middleware. Add the ability after the middleware name:

```rust
manager.api(Some("/posts"), |router| {
    router.get_with_middleware(
        "/{id}/edit",
        edit_post,
        "posts.edit",
        ["auth", "gate:posts:update"],
    );
});
```

The `auth` middleware identifies the actor first. The `gate:posts:update` middleware then resolves the `posts:update` ability and returns a denied response before the handler runs when the check fails.

The same ability can be configured for a route collection:

```dotenv
DTY_APP_WEB_MIDDLEWARE.ADMIN_ROUTE="auth,gate:admin:access"
```

See [Middleware](/docs/v1/middleware) for middleware parameters and ordering.

## Gate hooks

Use `Gate::before` for an early decision that applies before a named gate is resolved, and `Gate::after` for a fallback after the named gate and other checks have declined to respond:

```rust
Gate::before(|actor: Actor| async move {
    if actor.is_guest() {
        Some(GateResponse::deny())
    } else {
        None
    }
})
.await;
```

Use these hooks sparingly. Prefer explicit permissions or named gates when the rule belongs to one feature.

## Conditional permissions

Permissions can be associated with CEL expressions for contextual checks. For example, a `posts:delete` permission may require the actor to own the post. The permission must exist first; its condition then decides whether the current context satisfies the rule.

```text
posts:delete
```

```text
owner_id == actor_id
```

The context supplies the actor and other values used by the expression sandbox. Use a gate instead when the rule needs richer Rust logic or multiple service calls.

## Authorization failures

An authentication failure should return `401 Unauthorized`; an authenticated actor without the required ability should return `403 Forbidden`. Use `GateResponse::unauthorized()` for the former and `GateResponse::forbid()` for the latter when implementing custom guards or gates.
