---
outline: deep
---

# Extensions

Extensions are Dirtybase's main composition point. An extension owns a feature's setup and can register routes, middleware, services, CLI commands, migrations, and other application behavior.

Use extensions to keep a feature's setup close to its routes and services. Register every application extension before starting the runtime.

## Defining an extension

Implement `ExtensionSetup` for a struct. The extension can be empty when all of its behavior is expressed through trait methods:

```rust
use dirtybase_app::contract::{Context, ExtensionSetup};

#[derive(Default)]
struct BlogExtension;

#[async_trait::async_trait]
impl ExtensionSetup for BlogExtension {
    async fn setup(&mut self, _context: &Context) {
        // Register resources and initialize the feature.
    }
}
```

The `setup`, `boot`, and `run` hooks execute in that order. `shutdown` runs when the application stops.

## Registering an extension

Register an extension on the application service after setup and before calling `run`:

```rust
#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let app_service = dirtybase_app::setup().await?;
    app_service.register(BlogExtension).await;
    dirtybase_app::run(app_service).await
}
```

Dirtybase also registers its core extensions during `dirtybase_app::setup()`. Application extensions are added to the same extension collection.

## Lifecycle hooks

Use the hooks for distinct responsibilities:

| Hook | Purpose |
| --- | --- |
| `setup` | Initialize the feature and register resources that need the global context. |
| `boot` | Perform work after every extension has completed setup. |
| `run` | Start active or recurring feature work. |
| `shutdown` | Release resources and stop feature tasks. |
| `on_new_context` | React when a web request or CLI context is created. |

The extension manager calls each hook for the registered extensions in registration order.

## Registering routes

Implement `register_routes` to add routes to Dirtybase's route collections. The router supports named routes and route-specific middleware:

```rust
use dirtybase_app::contract::http_contract::RouterManager;

impl ExtensionSetup for BlogExtension {
    fn register_routes(&self, manager: &mut RouterManager) {
        manager.general(Some("/blog"), |router| {
            router.get("/", index, "blog.index");
        });

        manager.api(None, |router| {
            router.get("/posts", posts, "blog.posts");
        });
    }
}
```

Routes are grouped as general, API, insecure API, admin, or development routes. Their prefixes and enabled state come from [configuration](/docs/v1/configuration).

## Registering web middleware

Use `register_web_middlewares` for middleware shared by multiple routes or route groups:

```rust
use dirtybase_app::contract::http_contract::WebMiddlewareManager;

async fn register_web_middlewares(
    &self,
    mut manager: WebMiddlewareManager,
) -> WebMiddlewareManager {
    manager.register("blog", |request, _params, mut next| async move {
        next.call(request).await
    });

    manager
}
```

The middleware name can then be used by route middleware configuration or a route builder.

## CLI commands and middleware

Extensions can add commands to the Dirtybase CLI with `register_cli_commands` and wrap command execution with `register_cli_middlewares`. Use `on_cli_command` when a feature needs to react after a command has been selected.

```rust
async fn register_cli_commands(
    &self,
    manager: CliCommandManager,
) -> CliCommandManager {
    // Add the feature's commands to manager.
    manager
}
```

## Migrations

An extension can return its migrations from `migrations`. This keeps schema changes with the feature that owns the tables:

```rust
async fn migrations(
    &self,
    _context: &Context,
) -> Option<dirtybase_app::contract::ExtensionMigrations> {
    Some(vec![])
}
```

For generated application migrations, see the [CLI reference](/docs/v1/cli).

## Generated application extension

`dirtybase_cli init` creates `dirtybase_entry.rs` with an extension that wires together the application's modules:

```rust
pub struct Extension;

impl ExtensionSetup for Extension {
    async fn setup(&mut self, _context: &Context) {
        event_handler::setup().await;
    }

    fn register_routes(&self, manager: &mut RouterManager) {
        http::register_routes(manager);
    }
}
```

This generated extension is the starting point for application-specific routes, models, migrations, seeders, and event handlers.
