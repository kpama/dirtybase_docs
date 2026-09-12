---
outline: deep
---

# Configuration

Dirtybase reads application settings from TOML configuration and environment variables. The repository includes an application template at `packages/app/config_template/app.toml` and a complete environment template in `.env.defaults`.

## Environment files

Dirtybase loads these files in order:

1. `.env.defaults`
2. `.env.prod`
3. `.env.stage`
4. `.env`
5. `.env.dev`

Later files override values loaded by earlier files. This allows shared defaults to live in `.env.defaults`, deployment settings in `.env.prod` or `.env.stage`, and local development overrides in `.env` or `.env.dev`.

Dirtybase does not currently load a `.env.local` file. The staging filename is `.env.stage`, not `.env.staging`.

The environment name is set with `DTY_APP_ENV` and accepts `dev`, `stage` / `staging`, or `prod`:

```dotenv
DTY_APP_ENV="dev"
```

The default file is intended to be safe to commit. Keep secrets, encryption keys, and database credentials in environment-specific files that are excluded from source control.

## Shell environment variables

You can also set configuration values directly in the shell. Dirtybase reads these process environment variables when the application starts:

```sh
export DTY_APP_ENV=dev
export DTY_APP_WEB_PORT=8080
export DTY_DB_DEFAULT=sqlite

cargo run
```

For a one-off command, prefix the command instead of exporting values into the current shell:

```sh
DTY_APP_WEB_PORT=9000 cargo run
```

This is useful in CI and deployment environments where configuration is injected by the process manager rather than stored in a file. Shell environment variables use the same `DTY_*` names documented below.

## TOML configuration

Dirtybase can be configured through TOML files as well as environment variables. The application configuration loader looks for these files:

- `app.toml`
- `app_prod.toml`
- `app_stage.toml`
- `app_dev.toml`

They are loaded in that order, so environment-specific TOML files can override shared settings. By default, Dirtybase looks in the configured application directory. Set `DTY_APP_CONFIG_DIR` to use another directory.

The TOML configuration defines the application mode, name, security keys, and web server:

```toml
env = "dev"
name = "My App"
key = ""

web_port = 8080
web_ip_address = "0.0.0.0"
web_public_directory = "public"
web_static_files_route = "/assets"
```

The available application modes are `dev`, `staging`, and `prod`. TOML values can be overridden with the corresponding `DTY_APP_*` environment variable; for example, `web_port` maps to `DTY_APP_WEB_PORT`.

## Environment variables

Environment variables use the `DTY_` prefix and map to nested configuration values. For example:

```dotenv
DTY_APP_ENV="dev"
DTY_APP_NAME="My App"
DTY_APP_WEB_PORT=8080
DTY_APP_WEB_API_ROUTE_PREFIX="/api"
```

Use environment variables for values that change between machines or deployments, especially secrets and connection URLs. Do not commit production keys or credentials to source control.

## Web routes

Dirtybase can enable separate route collections and configure their prefixes:

```dotenv
DTY_APP_WEB_ENABLE_GENERAL_ROUTES=true
DTY_APP_WEB_ENABLE_API_ROUTES=true
DTY_APP_WEB_API_ROUTE_PREFIX="/api"
DTY_APP_WEB_ADMIN_ROUTE_PREFIX="/_admin"
DTY_APP_WEB_DEV_ROUTE_PREFIX="/_dev"
```

The framework also exposes configuration for cookies, middleware, trusted proxies, and CORS. Review `.env.defaults` for the complete list of available settings.

## Database

Select the default database driver and configure its connection URL through environment variables:

```dotenv
DTY_DB_ENABLE=true
DTY_DB_DEFAULT="sqlite"
DTY_DB_CLIENTS.SQLITE.WRITE.URL="sqlite::memory:"
```

Supported database values in the default configuration are `sqlite`, `mysql`, `mariadb`, and `postgres`. See the [database guide](/docs/v1/database) for the database layer and [migrations](/docs/v1/migrations) for schema changes.
