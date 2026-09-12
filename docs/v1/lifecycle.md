---
outline: deep
---

# Application Lifecycle

Dirtybase applications are created, configured, registered, initialized, and then run through an `AppService`. A minimal application follows this shape:

```rust
let app_service = dirtybase_app::setup().await?;
app_service.register(MyApp).await;
dirtybase_app::run(app_service).await
```

## Application phases

The application moves through these phases:

1. **Configuration**: `dirtybase_app::setup()` loads `app.toml`, environment files, and `DTY_*` values, then creates the application service.
2. **Registration**: `app_service.register(extension).await` adds application and package extensions to the extension collection. Registration happens before initialization.
3. **Core setup**: `app_service.init().await` registers Dirtybase resources such as the service container and CEL observability resources.
4. **Extension setup**: each extension's `setup` hook runs. Use this for initial registration that requires the global context.
5. **Boot**: each extension's `boot` hook runs after setup has completed.
6. **Run**: each extension's `run` hook runs after boot. This is where an extension can start its active work.
7. **Command or HTTP execution**: the runtime dispatches CLI commands, and HTTP startup registers the configured route and middleware collections.
8. **Shutdown**: Ctrl-C or a termination signal calls each extension's `shutdown` hook and cancels the application cancellation token.

`init` is idempotent. Once the extension manager is ready, another initialization attempt does not run the lifecycle hooks again.

For implementation details and examples, see [Extensions](/docs/v1/extensions). The extension contract also supports context hooks, request and response hooks, CLI middleware and commands, and migrations.

## HTTP lifecycle

Routes and middleware are registered by extensions before requests are served. Each request receives a context, then extensions can observe the request and response through `on_web_request` and `on_web_response`. Route-specific behavior belongs in handlers; cross-cutting behavior belongs in web middleware.

## CLI lifecycle

After initialization, `dirtybase_app::run` hands control to the CLI command manager. Extensions can register commands with `register_cli_commands`, add CLI middleware with `register_cli_middlewares`, and react to a command with `on_cli_command`.

## Shutdown

Dirtybase installs Ctrl-C and Unix termination signal handlers during setup. On shutdown, registered extensions are notified in registration order and the application cancellation token is cancelled. Long-running tasks should observe that token so they can stop cleanly.
