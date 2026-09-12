---
outline: deep
---

# Routing

Routes are registered by implementing `register_routes` on an extension. Dirtybase's `RouterManager` groups routes by purpose and applies each group's configured prefix.

## Route collections

Dirtybase provides five route collections:

| Collection | Default prefix | Intended use |
| --- | --- | --- |
| `general` | None | Public web pages and general HTTP routes. |
| `api` | `/api` | Protected or application API endpoints. |
| `insecure_api` | `/_open` | API endpoints that do not use the protected API group. |
| `backend` | `/_admin` | Administrative routes. |
| `dev` | `/_dev` | Development-only routes. |

The prefixes and enabled state are configured with `DTY_APP_WEB_*` settings. A route group prefix is appended to the collection prefix.

## Basic routing

Use the HTTP method helpers on `RouterBuilder`:

```rust
fn register_routes(&self, manager: &mut RouterManager) {
    manager.general(None, |router| {
        router
            .get("/", home, "home")
            .post("/posts", create_post, "posts.create")
            .put("/posts/{id}", update_post, "posts.update")
            .delete("/posts/{id}", delete_post, "posts.delete");
    });
}
```

Named methods such as `get`, `post`, and `delete` require a route name. The `_x` variants, such as `get_x`, register the route without a name:

```rust
manager.general(None, |router| {
    router.get_x("/health", health_check);
});
```

The builder also supports `patch`, `head`, `options`, `trace`, `any`, and `any_of`.

## Named routes

Named routes make a route addressable without repeating its path. Use a stable, feature-specific name such as `users.show` or `admin.dashboard`:

```rust
manager.api(Some("/users"), |router| {
    router.get("/{id}", show_user, "users.show");
});
```

## Prefixes and groups

Route URLs are built from the collection prefix, an optional group prefix, and the route path. For example, the default API prefix plus `/blog` produces `/api/blog/posts`:

```rust
manager.api(Some("/blog"), |router| {
    router.get("/posts", list_posts, "blog.posts");
});
```

### Nesting routes

Use `nest` when a set of routes shares another path segment:

```rust
manager.api(Some("/admin"), |router| {
    router.nest("/reports", |reports| {
        reports.get("/daily", daily_report, "reports.daily");
    });
});
```

The route above is available at `/api/admin/reports/daily`.

### Merging routes

Use `merge` to combine route builders without adding another path prefix:

```rust
manager.api(Some("/admin"), |router| {
    router.merge(|admin| {
        admin.get("/users", users, "admin.users");
        admin.get("/settings", settings, "admin.settings");
    });
});
```

The merged routes are available at `/api/admin/users` and `/api/admin/settings`. The `/admin` prefix comes from the enclosing API group; `merge` does not add a prefix of its own.

## Route middleware

Apply named middleware to an individual route with a `*_with_middleware` method:

```rust
router.get_with_middleware(
    "/account",
    account,
    "account.show",
    ["auth"],
);
```

For a complete route group, use `group_with_middleware` or register middleware in configuration. See [Middleware](/docs/v1/middleware).
