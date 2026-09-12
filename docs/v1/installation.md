---
outline: deep
---

# Installation

Dirtybase is currently installed from its Git repository as a Cargo workspace.

## Install Rust

Install Rust and Cargo with [rustup](https://rustup.rs/), then confirm that they are available:

```sh
rustc --version
cargo --version
```

Dirtybase uses the Rust 2024 edition, so use a current stable Rust toolchain.

## Clone Dirtybase

Clone the framework and move into its directory:

```sh
git clone https://github.com/kpama/dirtybase.git
cd dirtybase
```

Build the workspace to download dependencies and verify the local toolchain:

```sh
cargo build
```

## Create an application

Use the bundled CLI to generate a new application package:

```sh
cargo run -p cli -- new my_app
```

See the [CLI reference](/docs/v1/cli) for migration and seeder generators.

## Run the example

The repository includes an application example that can be started with Cargo:

```sh
cargo run -p dirtybase_app --example app_basic
```

From here, continue with [configuration](/docs/v1/configuration), [routing](/docs/v1/routing), or the [ORM guide](/docs/v1/orm/).
