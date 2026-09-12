---
outline: deep
---

# ORM

Dirtybase's ORM is a thin, derive-based layer over the database manager. You define Rust structs that represent database tables, derive `DirtyTable`, and use the generated repository to query and persist them.

## A model

```rust
use dirtybase_db_macro::DirtyTable;

#[derive(Debug, Default, DirtyTable)]
struct Post {
    id: Option<i64>,
    title: String,
    content: String,
}
```

The derive generates table metadata, field conversion functions, column helpers, and a `PostRepo` repository. By convention this model maps to the `posts` table.

## A repository

Create a repository from a database manager:

```rust
let mut posts = Post::repo_instance(&manager);
let recent_posts = posts.latest().await?;
```

Repositories provide model-oriented operations such as `get`, `one`, `by_id`, `insert`, `update`, `delete`, `paginate`, and relationship loading. See [Repositories](/docs/v1/orm/repository).

## Relationships

Relationships are declared on model fields with `#[dirty(rel(...))]` metadata. The derive generates repository methods for related records and joins:

```rust
#[derive(Debug, Default, DirtyTable)]
struct User {
    id: Option<i64>,
    posts: Vec<Post>,
}
```
See [Relationships](/docs/v1/orm/relationship) for relation metadata and loading.

## ORM versus query builder

Use the ORM when a query represents a model and its domain relationships. Use the [Query Builder](/docs/v1/query-builder) for projections, reports, aggregates, or queries that do not map cleanly to one model.

## ORM guide

- [Models](/docs/v1/orm/model): table mapping, fields, timestamps, and soft deletes.
- [Repositories](/docs/v1/orm/repository): generated queries and persistence methods.
- [Relationships](/docs/v1/orm/relationship): related models and joins.
- [Advanced Usage](/docs/v1/orm/deeper): generated methods and `DirtyTable` configuration.
