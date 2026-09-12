---
outline: deep
---

# Migrations

Migrations describe changes to the database schema and are owned by an application extension. Dirtybase tracks each migration by its `id` and gives it access to a database manager and context.

## Generate a migration

Use the CLI from the Dirtybase workspace:

```sh
cargo run -p cli -- --package my_app make migration "Create cars table"
```

The generator creates a migration file in `src/dirtybase_entry/migration/` and updates the migration module at `src/dirtybase_entry/migration.rs`.

## Migration lifecycle

Every migration can implement these operations:

```rust
#[async_trait::async_trait]
impl Migration for CreateCarsTable {
    async fn setup(&self, _context: &Context) -> Result<(), anyhow::Error> {
        Ok(())
    }

    async fn should_run(&self, _context: &Context) -> bool {
        true
    }

    async fn up(
        &self,
        manager: &Manager,
        _context: &Context,
    ) -> Result<(), anyhow::Error> {
        // Apply the schema change with manager.
        Ok(())
    }

    async fn down(
        &self,
        manager: &Manager,
        _context: &Context,
    ) -> Result<(), anyhow::Error> {
        // Revert the schema change with manager.
        Ok(())
    }
}
```

`setup` runs before the migration, `should_run` decides whether it is applicable, `up` applies it, and `down` reverts it. The default migration ID is the type name converted to lowercase; override `id` when a stable custom identifier is needed.

## Register migrations

The generated `dirtybase_entry.rs` extension exposes migrations through its `migration` module. Keep each migration registered by the extension that owns its tables so the schema and feature remain together.

Run `cargo run -p cli -- --help` in the application workspace to see the migration commands available in the current CLI build.
