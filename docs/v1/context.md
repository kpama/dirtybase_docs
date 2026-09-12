---
outline: deep
---

# Context

Dirtybase provides application and request context for sharing configured resources across the framework. A `Context` is a typed, asynchronous container that carries values for one application scope, request, or CLI command.

Use context instead of global mutable state when an extension needs to resolve a framework service, attach request data, or pass information between middleware and handlers.

## Context scopes

Dirtybase uses two main context scopes:

- **Global context**: created during application initialization and used for application-wide resources.
- **Request or command context**: created for an individual HTTP request or CLI command. Values placed here are isolated from other requests and commands.

The context has a unique ID, which is useful for request tracing and logging. `Context::is_global()` identifies the global context.

The application lifecycle creates the global context before extension setup. See [Application Lifecycle](/docs/v1/lifecycle) for when contexts are created.

## Storing and resolving values

Values are stored by type and must be cloneable, sendable, and shareable across async tasks:

```rust
#[derive(Clone)]
struct RequestLabel(String);

async fn add_label(context: &Context) {
    context.set(RequestLabel("dashboard".into())).await;
}

async fn read_label(context: &Context) -> Option<String> {
    context.get::<RequestLabel>().await.ok().map(|label| label.0)
}
```

`get` first checks the current context and then asks Dirtybase's resource managers to resolve the value. Missing values return an error, so use `Result` when the value is required and `Option` when it is optional.

## Configuration through context

Configuration can be resolved from context using `get_config` or cached in the context using `get_config_once`:

```rust
let config = context.get_config_once::<MyConfig>("my_feature").await?;
```

If a tenant context is present, tenant-specific configuration is checked before the application configuration. See [Configuration](/docs/v1/configuration) for the available application settings.

## Context metadata

Metadata is a lightweight string map for tracing and diagnostics:

```rust
let metadata = context.metadata().await;
metadata.add("feature", "billing".into());

let feature = metadata.get("feature");
```

Use metadata for request IDs, feature names, and diagnostic values. Put typed application data in the context itself.

## Request extractors

Handlers can receive the current context through Dirtybase's Axum extractors:

```rust
async fn handler(
    RequestContext(context): RequestContext,
) -> impl IntoResponse {
    format!("request {}", context.id())
}
```

`CtxExt<T>` resolves a typed value from the current request context. It can also use a registered binding or model binder:

```rust
async fn handler(CtxExt(user): CtxExt<User>) -> impl IntoResponse {
    format!("Hello {}", user.name)
}
```

Use `OptionCtxExt<T>` when the value is optional. `CtxExt<T>` returns an error response if the value cannot be resolved, while `OptionCtxExt<T>` supplies `None`.

## Context resources

`ContextResourceManager<T>` manages how a typed resource is created, reused, and dropped. Resources can be registered with one of three lifetimes:

- **Scoped**: a new value is resolved for the current request or command.
- **Forever**: a value remains available for the lifetime of the application.
- **Idle timeout**: a cached value is removed after it has been unused for the configured number of seconds.

Resource managers observe the application cancellation token and clean up their cached values during shutdown. This makes them suitable for database clients, external service clients, and other resources that need explicit cleanup.

## Context and extensions

Extensions receive context in lifecycle hooks and can add their own values or resolve framework services:

```rust
async fn setup(&mut self, context: &Context) {
    context.set(MyService::new()).await;
}
```

Keep context setup in the extension that owns the resource. See [Extensions](/docs/v1/extensions) for registration and hook details.
