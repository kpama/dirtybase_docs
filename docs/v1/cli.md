---
outline: deep
---

# CLI Commands

Dirtybase has two related CLI surfaces:

- The standalone `cli` binary generates applications, migrations, seeders, and initialized feature files.
- The application runtime registers commands from installed extensions, such as Cron commands.

When working from the Dirtybase repository, invoke the standalone binary through Cargo:

```sh
cargo run -p cli -- <command>
```

After installing it with `cargo install --path bin/cli`, invoke the same CLI globally as `dirtybase_cli`:

```sh
dirtybase_cli <command>
```

Inspect the currently compiled command set at any time:

```sh
cargo run -p cli -- --help
```

## Create an application

Create a new Cargo application and initialize the Dirtybase feature structure:

```sh
cargo run -p cli -- new my_app
```

The command runs `cargo new`, creates the `dirtybase_entry` files and directories, and adds the default `.env.defaults` template. It prints the framework crates that still need to be added to the generated `Cargo.toml`.

The generated structure is described in [Project Structure](/docs/v1/project-structure).

## Initialize a package

Initialize Dirtybase files in an existing package:

```sh
cargo run -p cli -- init
```

When working from a workspace, target a package by name or path with `--package` or `-p`:

```sh
cargo run -p cli -- --package my_app init
```

Initialization creates the `dirtybase_entry` module, HTTP, model, migration, seeder, and event directories, then registers `dirtybase_entry` in the package's `lib.rs` or `main.rs`.

## Generate a migration

Generate a migration for the current package:

```sh
cargo run -p cli -- make migration "Create users table"
```

Target a specific workspace package with:

```sh
cargo run -p cli -- --package my_app make migration "Create users table"
```

The command creates the migration file in `src/dirtybase_entry/migration/` and updates `src/dirtybase_entry/migration.rs`. See [Migrations](/docs/v1/migrations).

## Generate a seeder

Generate a seeder for the current package:

```sh
cargo run -p cli -- make seeder "Create admin user"
```

Or target a workspace package:

```sh
cargo run -p cli -- --package my_app make seeder "Create admin user"
```

The first seeder creates the seeder module and directory. Later commands add seeders under `src/dirtybase_entry/seeder/`. See [Seeding](/docs/v1/seeding).

## Package selection

The standalone CLI's `--package` option selects the package that `init`, `make migration`, or `make seeder` operates on:

```sh
cargo run -p cli -- --package my_app init
cargo run -p cli -- --package my_app make migration "Add status"
cargo run -p cli -- --package my_app make seeder "Create roles"
```

This is different from Cargo's `-p cli` option, which selects the Dirtybase CLI package to run.

## Application commands

The application runtime can add commands through extensions. Run an application's commands from the application package rather than the standalone generator:

```sh
cargo run -- <command>
```

The exact commands depend on the extensions registered by the application. Use the application's help output to inspect them:

```sh
cargo run -- --help
```

Extensions can register commands with `register_cli_commands`, add CLI middleware with `register_cli_middlewares`, and react to selected commands with `on_cli_command`. See [Extensions](/docs/v1/extensions) and [Application Lifecycle](/docs/v1/lifecycle).

## Cron commands

When the Cron extension is registered, the application exposes the `cron` command:

```sh
cargo run -- cron start
cargo run -- cron run cleanup::expired
cargo run -- cron stop cleanup::expired
cargo run -- cron end cleanup::expired
cargo run -- cron exit
```

The commands perform these actions:

- `cron start`: schedule and start configured jobs.
- `cron run <id>`: run one job by ID.
- `cron stop <id>`: pause a job without removing it.
- `cron end <id>`: stop and remove a job.
- `cron exit`: stop all running jobs and exit.

See [Queues and Cron](/docs/v1/queues) for job configuration and scheduling.

## Implemented commands

The standalone CLI currently implements `init`, `new`, `make migration`, and `make seeder`. The `make` help text may mention controllers, models, events, or handlers, but those generators are not currently implemented. Treat `--help` output as the source of truth for the binary version being used.
