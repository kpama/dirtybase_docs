---
outline: deep
---

# Database

Dirtybase's database layer is built on SQLx. It provides connection management, migrations, seeders, query builders, and the model/repository abstractions used by the ORM.

## Configure a database

Enable the database extension and select the default driver:

```dotenv
DTY_DB_ENABLE=true
DTY_DB_DEFAULT="sqlite"
DTY_DB_CLIENTS.SQLITE.WRITE.URL="sqlite::memory:"
```

The default configuration supports `sqlite`, `mysql`, `mariadb`, and `postgres`. Each driver can have separate read and write clients:

```dotenv
DTY_DB_CLIENTS.POSTGRES.READ.ENABLE=true
DTY_DB_CLIENTS.POSTGRES.READ.URL="postgres://user:password@localhost/app"
DTY_DB_CLIENTS.POSTGRES.WRITE.ENABLE=true
DTY_DB_CLIENTS.POSTGRES.WRITE.URL="postgres://user:password@localhost/app"
```

Connection pool size, foreign-key behavior, idle timeouts, and sticky writes are also configurable. Keep credentials in environment-specific configuration; see [Configuration](/docs/v1/configuration) for `.env` and TOML loading.

## Database extension

The database service is registered during application setup. The extension makes database managers available through the application and request [context](/docs/v1/context). Feature extensions then contribute migrations, seeders, models, and repositories.

The standard `dirtybase_app::setup()` path registers the database extension as part of the core application setup:

```rust
let app_service = dirtybase_app::app::App::new(&config).await?;

app_service.register(dirtybase_db::Extension).await;
```

In a normal application, call `dirtybase_app::setup()` instead of constructing the service yourself. Dirtybase registers `dirtybase_db::Extension` for you:

```rust
let app_service = dirtybase_app::setup().await?;
app_service.register(MyApp).await;
dirtybase_app::run(app_service).await;
```

Only register the database extension manually when building a custom application setup and intentionally replacing the standard core registration.

## Choosing an abstraction

- Use the database manager and query builders when a query does not map cleanly to a model.
- Use a model for a table-backed domain type.
- Use a repository to keep reusable queries out of handlers and extensions.

See [Query Builder](/docs/v1/query-builder) for query construction and the [ORM](/docs/v1/orm/) section for models and repositories.

For schema changes, use [migrations](/docs/v1/migrations). For initial or repeatable data, use [seeders](/docs/v1/seeding). The ORM builds on these database services with models, repositories, and relationships.
