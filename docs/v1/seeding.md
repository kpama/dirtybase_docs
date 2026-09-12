---
outline: deep
---

# Seeding

Seeders populate a database with application data. They are registered by an application extension and receive both a database manager and a Dirtybase context.

## Generate a seeder

Create a seeder with the Dirtybase CLI:

```sh
cargo run -p cli -- --package my_app make seeder "Create users"
```

The first seeder creates `src/dirtybase_entry/seeder.rs` and the seeder module under `src/dirtybase_entry/seeder/`.

## Register a seeder

Register seeders from the extension's `on_cli_command` hook:

```rust
mod seeder;

use dirtybase_contract::cli_contract::prelude::ArgMatches;
use dirtybase_contract::prelude::Context;

#[derive(Default)]
pub struct Extension;

#[dirtybase_contract::async_trait]
impl dirtybase_contract::ExtensionSetup for Extension {
    async fn on_cli_command(
        &self,
        cmd: &str,
        matches: ArgMatches,
        _context: Context,
    ) -> ArgMatches {
        if cmd == "seed" {
            seeder::register_seeders().await;
        }

        matches
    }
}
```

The generated `register_seeders` function wires the seeder module into Dirtybase's seeder registerer.

## Seeder callbacks

Seeders are registered by name with a callback that receives a database manager and context:

```rust
SeederRegisterer::register("users", |manager, context| async move {
    // Insert the required data using manager and context.
})
.await;
```

The CLI can run a named seeder, run all seeders, or list registered seeders depending on the command options available in the current CLI build. Use `cargo run -p cli -- --help` to inspect them.
