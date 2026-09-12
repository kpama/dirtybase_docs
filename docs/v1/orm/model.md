---
outline: deep
---

# Models

A Dirtybase model is a Rust struct that derives `DirtyTable`. The derive connects struct fields to database columns and generates the metadata used by queries and repositories.

## Basic model

```rust
use dirtybase_db_macro::DirtyTable;

#[derive(Debug, Default, DirtyTable)]
struct Post {
    id: Option<i64>,
    title: String,
    content: String,
}
```

By default, the model maps to the pluralized table name, so `Post` maps to `posts`. The default primary key field is `id`.

## Table metadata

Use the `dirty` attribute to override table behavior:

```rust
#[derive(Debug, Default, DirtyTable)]
#[dirty(table = "social_posts", id = "internal_id", id_column = "post_id")]
struct Post {
    internal_id: Option<i64>,
    title: String,
}
```

Important table options include:

- `table`: explicit table name.
- `id`: Rust field used as the model ID.
- `id_column`: database column used as the ID.
- `id_not_auto`: use a non-incrementing ID.
- `timestamp`: enable created and updated timestamps.
- `soft_delete`: enable the deleted-at column and soft-delete behavior.

## Column mapping

Use field-level attributes when Rust and database names differ or when a field should not participate in normal queries:

```rust
#[derive(Debug, Default, DirtyTable)]
struct Post {
    id: Option<i64>,

    #[dirty(col = "post_title")]
    title: String,

    #[dirty(skip_select)]
    secret_token: String,
}
```

Available field options include `col`, `skip`, `skip_select`, `skip_insert`, `flatten`, and `embedded`. Custom conversion functions can be registered with `from` and `into`.

## Timestamps

Enable timestamps with `timestamp`:

```rust
#[derive(Debug, Default, DirtyTable)]
#[dirty(timestamp)]
struct Product {
    id: Option<i64>,
    name: String,
    created_at: Option<DateTimeField>,
    updated_at: Option<DateTimeField>,
}
```

Rename timestamp columns with `created_at = "created"` or `updated_at = "last_updated"`.

## Soft deletes

Soft deletes keep a row in the database but mark it as deleted with a timestamp. This preserves the record for recovery, auditing, or historical references while excluding it from normal repository queries.

Enable soft deletes with `soft_delete`:

```rust
#[derive(Debug, Default, DirtyTable)]
#[dirty(soft_delete)]
struct Product {
    id: Option<i64>,
    name: String,
    deleted_at: Option<DateTimeField>,
}
```

The migration for this model must create the `deleted_at` column as a nullable datetime. Active records have a null value; a soft-deleted record has the deletion time in that column.

Soft-deletable repositories exclude deleted records by default. The generated methods have these behaviors:

- `delete` sets the deleted-at timestamp and keeps the row.
- `with_trashed` includes active and soft-deleted rows.
- `trashed_only` returns only soft-deleted rows.
- `restore` clears the deleted-at timestamp.
- `destroy` permanently removes the row.

```rust
let mut products = Product::repo_instance(&manager);

products.delete_by_id(7).await?;       // Soft delete.
let deleted = products.trashed_only().get().await?;
products.restore(7).await?;             // Make it active again.
products.destroy_by_id(7).await?;       // Permanent delete.
```

Rename the column with `deleted_at = "deleted_on"`. To opt out of soft deletes entirely, use `no_soft_delete` and omit the deleted-at behavior from the model.

See [Advanced Usage](/docs/v1/orm/deeper) for the generated metadata and conversion methods.
