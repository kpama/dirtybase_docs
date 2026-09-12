---
outline: deep
---

# Middleware

Dirtybase uses Axum's middleware model. Middleware can be attached to route groups or registered as part of an extension.

Use middleware for cross-cutting HTTP concerns such as authentication, request metadata, CORS, and response handling. Keep resource-specific behavior in handlers or services.

## Register middleware

Register a named middleware in an extension:

```rust
async fn register_web_middlewares(
    &self,
    mut manager: WebMiddlewareManager,
) -> WebMiddlewareManager {
    manager.register("request-log", |request, _params, next| async move {
        tracing::info!(method = ?request.method(), path = ?request.uri().path());
        next.call(request).await
    });

    manager
}
```

The handler receives the Axum request, a `MiddlewareParam`, and the next service. It must call `next.call(request).await` to continue the request unless it intentionally returns an early response.

## Apply middleware to routes

Use route helpers when middleware belongs to one route:

```rust
router.get_with_middleware(
    "/account",
    account,
    "account.show",
    ["auth"],
);
```

The builder also provides `group_with_middleware` for an entire route group and `route_layer` / `layer` for Axum-compatible layers.

## Middleware parameters

Middleware names can include a kind and arguments:

```text
auth:jwt>role=admin,scope=reports
```

Inside the middleware, read them from `MiddlewareParam`:

```rust
let kind = params.kind_ref();
let role = params.arg("role");
```

The name is `auth`, the kind is `jwt`, and the remaining values are key-value arguments.

## Configuration

Middleware can be assigned to route collections through environment variables:

```dotenv
DTY_APP_WEB_MIDDLEWARE.GLOBAL="request-log"
DTY_APP_WEB_MIDDLEWARE.API_ROUTE="auth:jwt"
DTY_APP_WEB_MIDDLEWARE.ADMIN_ROUTE="auth"
```

The same settings can be represented in `app.toml` under `[web_middleware]`. Collection middleware is applied when the route collection is built. See [Configuration](/docs/v1/configuration) and [Authentication](/docs/v1/authentication).
