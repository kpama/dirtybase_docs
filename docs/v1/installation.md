---
outline: deep
---

# Installation

Dirtybase's CLI tooling is currently distributed as part of the Dirtybase Git repository. Download the repository if you want to use the CLI to create an application or generate migrations and seeders. The CLI is not yet distributed as a separate installed binary.

## Install Rust

Install Rust and Cargo with [rustup](https://rustup.rs/), then confirm that they are available:

```sh
rustc --version
cargo --version
```

Dirtybase uses the Rust 2024 edition, so use a current stable Rust toolchain.

## Download the CLI tooling

Clone Dirtybase and move into its directory:

```sh
git clone https://github.com/kpama/dirtybase.git
cd dirtybase
```

Build the workspace to download the CLI and framework dependencies and verify the local toolchain:

```sh
cargo build
```

Building does not add the CLI to your shell's `PATH`. Install the CLI globally from the cloned repository with Cargo:

```sh
cargo install --path bin/cli
```

The executable is named `dirtybase_cli` and is installed into Cargo's binary directory, usually `~/.cargo/bin`. To confirm that the cli is installed properly, use the command below. You may need to restart your `$SHELL`.

```sh
dirtybase_cli --help
```

## Create an application with the CLI

Use the globally installed CLI, or invoke the same binary through Cargo from the cloned repository, to generate a new application package:

```sh
dirtybase_cli new my_app
# Equivalent repository-local invocation:
cargo run -p cli -- new my_app
```

See the [CLI reference](/docs/v1/cli) for migration and seeder generators.

## Run the example

The repository includes an application example that can be started with Cargo:

```sh
cargo run -p dirtybase_app --example app_basic
```

From here, continue with [configuration](/docs/v1/configuration), [routing](/docs/v1/routing), or the [ORM guide](/docs/v1/orm/).
