---
outline: deep
---

# Project Structure

Dirtybase applications are ordinary Cargo packages with a `dirtybase_entry` module for application-owned code. Running `dirtybase_cli init` adds the entry module and its feature directories to an existing package.

## Application layout

A newly initialized application has this basic structure:

```text
my_app/
├── Cargo.toml
├── src/
│   ├── lib.rs                 # or main.rs; the CLI registers dirtybase_entry here
│   └── dirtybase_entry.rs     # application extension
│       ├── event.rs
│       ├── event_handler.rs
│       ├── http.rs
│       ├── http/
│       │   └── general.rs     # HTTP handlers and route registration
│       ├── migration.rs
│       ├── migration/
│       ├── model.rs
│       ├── model/
│       ├── seeder.rs
│       └── seeder/
└── .env.defaults
```

The exact location of `dirtybase_entry` follows the package's `src` directory. The generated module is an extension: it registers routes, migrations, event handlers, and seeders with Dirtybase.

### Entrypoint

The CLI adds `pub mod dirtybase_entry;` to the package's `lib.rs` or `main.rs`. Your binary or library entrypoint remains responsible for starting Dirtybase, typically through `dirtybase_app::setup()` and `dirtybase_app::run()`.

### HTTP

`dirtybase_entry/http.rs` registers the application's route groups. Handlers can be organized in files below `dirtybase_entry/http/`, such as the generated `general.rs` handler:

```rust
pub(crate) fn register_routes(manager: &mut RouterManager) {
    manager.general(Some("/my_app"), |router| {
        router.get_x("/", general::index_handler);
    });
}
```

### Models

`dirtybase_entry/model.rs` is the module boundary for application models, while `dirtybase_entry/model/` holds individual model files. The initializer creates these files and directories, but does not generate model definitions automatically. Add model structs and database behavior there as the application grows.

### Migrations and seeders

Migrations live in `dirtybase_entry/migration/` and are registered through `migration.rs`. Seeders follow the same pattern under `dirtybase_entry/seeder/`. Generate new files with the [CLI commands](/docs/v1/cli):

```sh
cargo run -p cli -- --package my_app make migration "Create users table"
cargo run -p cli -- --package my_app make seeder "Create admin user"
```

### Events

Use `event.rs` for event definitions and `event_handler.rs` to register handlers. The generated `dirtybase_entry.rs` extension calls the event-handler setup during application initialization.

## Framework workspace

Dirtybase itself is organized as a Cargo workspace. The main areas are:

- `packages/app`: application setup and runtime
- `packages/db`: database services
- `packages/auth`: authentication and authorization
- `packages/cache`: cache backends
- `packages/session`: session storage
- `packages/multitenant`: tenant resolution and middleware
- `contract`: shared framework contracts
- `bin/cli`: the Dirtybase command-line tool

An application registers its behavior through extensions instead of placing all framework behavior in one global module.
