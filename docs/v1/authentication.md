---
outline: deep
---

# Authentication

Dirtybase authentication provides actors, credentials, password verification, sessions, tokens, guards, and authentication middleware. The authenticated actor is resolved before a protected handler runs and can then be read from the request [context](/docs/v1/context).

## Enable authentication

Authentication is registered by the standard application setup. Configure the feature in `.env` or TOML:

```dotenv
DTY_AUTH_ENABLE=true
DTY_AUTH_STORAGE="memory"
DTY_AUTH_ALLOW_SELF_SIGNUP=true
DTY_AUTH_JWT_KEY="replace-this-in-production"
```

The built-in storage options are `memory` and `database`. A custom storage provider can be selected through the auth storage configuration. Use database storage when actors and credentials must survive process restarts.

Keep `DTY_AUTH_JWT_KEY` and the application encryption key out of source control. Set them through deployment environment variables or a private environment file.

## Actors

An actor is Dirtybase's authenticated-user model. The built-in actor includes a username, email hash, password hash, status, login metadata, roles, and permissions. Actors are soft-deletable and timestamped.

Actor status can be `active`, `inactive`, `pending`, `suspended`, or `unknown`. Authentication should only succeed for actors that are eligible to sign in according to the configured auth behavior.

Use `ActorPayload` when creating or updating an actor instead of handling password hashing yourself:

```rust
let mut payload = ActorPayload::new();

// Persist the payload through the configured auth/database service.
```

Dirtybase hashes passwords with Argon2 and hashes email addresses before storage. Do not store or log raw passwords.

## Login credentials

`LoginCredential` is an Axum form extractor for login requests. It accepts a username or email, a password, an optional role ID, and `remember_me`:

```rust
async fn login(credentials: LoginCredential) -> impl IntoResponse {
    let password = credentials.password();
    let remember = credentials.remember_me();

    // Resolve and verify the actor with the configured auth service.
    // Do not log password.
    let _ = (password, remember);
    "signed in"
}
```

The default login route settings are configurable:

```dotenv
DTY_AUTH_SIGNIN_FORM_ROUTE="auth:signin-form"
DTY_AUTH_AUTH_ROUTE="auth:do-signin"
```

## Protect routes

Dirtybase registers the `auth` web middleware. Apply it to a route or route collection:

```rust
manager.api(None, |router| {
    router.get_with_middleware(
        "/account",
        account,
        "account.show",
        ["auth"],
    );
});
```

For token-based API authentication, use the JWT middleware form:

```dotenv
DTY_APP_WEB_MIDDLEWARE.API_ROUTE="auth:jwt"
```

The middleware resolves the actor and returns an unauthorized response when authentication fails. See [Middleware](/docs/v1/middleware) for named middleware and parameters.

## Access the authenticated actor

Authentication stores the resolved actor in the current request context. Use a context extractor in a handler or service:

```rust
async fn account(CtxExt(actor): CtxExt<Actor>) -> impl IntoResponse {
    format!("Hello {}", actor.username_ref())
}
```

When authentication is optional, use `OptionCtxExt<Actor>` and handle `None` as a guest request. See [Context](/docs/v1/context) for typed context resolution.

## Guards

A guard resolves an actor from request headers, context, and an auth storage provider. Custom guards can be registered by name:

```rust
GuardResolver::register("internal", |resolver| async move {
    // Inspect resolver.headers_ref(), resolve an actor, and return a GuardResponse.
    GuardResponse::unauthorized()
})
.await;
```

Return `GuardResponse::success(actor)` when authentication succeeds, `unauthorized()` when credentials are missing or invalid, or `forbid()` when the request is authenticated but not allowed. Successful guards place authentication state into the context for observers and handlers.

## Sessions and tokens

Authentication can work with session-backed or token-backed flows. Session storage and lifetime are configured separately through the [Sessions](/docs/v1/sessions) service. JWT API flows use `DTY_AUTH_JWT_KEY`; configure the API route collection with `auth:jwt` middleware.

Actors can generate signed JWT claims and application tokens after they have been persisted. Rotate an actor's salt when existing actor tokens need to be invalidated.

## Authentication and authorization

Authentication answers "who is this request?" Authorization answers "may this actor perform this action?" Once the actor is resolved, use roles, permissions, and gates for access decisions. Continue with [Authorization](/docs/v1/authorization).
