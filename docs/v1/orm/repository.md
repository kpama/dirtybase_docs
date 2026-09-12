---
outline: deep
---

# Repositories

`DirtyTable` generates a repository for each model. For a `Post` model, the generated repository is `PostRepo`.

## Create a repository

Create a repository from a database manager:

```rust
let mut posts = Post::repo_instance(&manager);
```

Repositories are stateful query builders. Configure a repository, execute it, and create a fresh repository for the next independent query.

## Read records

```rust
let all_posts = Post::repo_instance(&manager).get().await?;

let mut posts = Post::repo_instance(&manager);
let post = posts.by_id(1).await?;
let latest = posts.latest().await?;
let total = posts.count().await?;
```

Use `find_by` and `find_all_by` to apply query-builder conditions:

```rust
let mut posts = Post::repo_instance(&manager);
let published = posts
    .find_all_by(|query| {
        query.is_eq(Post::col_name_for_title(), "Hello");
    })
    .await?;
```

The exact condition methods depend on the database query builder. For reporting queries that do not represent complete models, use the [Query Builder](/docs/v1/query-builder) directly.

## Write records

Generated repositories provide insert, update, delete, and destroy operations:

```rust
let mut posts = Post::repo_instance(&manager);

let post = posts
    .insert(Post {
        id: None,
        title: "Hello".into(),
        content: "...".into(),
    })
    .await?;

let updated = posts.update(post).await?;
posts.delete_by_id(1).await?;
```

For soft-deletable models, `delete` marks the record as deleted and normal queries hide it. Call `with_trashed` when an administrative workflow needs both active and deleted records, or `trashed_only` when it needs the recycle-bin view. `restore` clears the deleted-at value; `destroy` removes the row permanently and cannot be undone through the ORM.

## Pagination

Repositories expose both page-based and cursor-based pagination:

```rust
let mut posts = Post::repo_instance(&manager);
let page = posts.paginate(None).await?;
```

Pass a `PaginateBuilder` or `CursorBuilder` when the endpoint needs explicit page size, offset, or cursor behavior.

## Relationships

Relationship methods are generated from model metadata. Load relationships before executing the repository query, then call `get`, `one`, or a paginator. See [Relationships](/docs/v1/orm/relationship).
