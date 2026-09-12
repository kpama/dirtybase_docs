---
outline: deep
---

# Relationships

Relationships describe how one model is connected to another. Dirtybase reads relation metadata from `DirtyTable` fields and generates repository methods that load related records.

## Relation metadata

Declare the related model as the field type and specify the relation kind with `rel`:

```rust
#[derive(Debug, Default, DirtyTable)]
struct User {
    id: Option<i64>,

    #[dirty(rel(kind = has_many, foreign_col = "user_id"))]
    posts: Vec<Post>,
}
```

The relation attributes can specify local and foreign columns when the defaults do not match the schema. Keep the relation field out of the table's scalar columns; Dirtybase treats it as related data.

## Relationship types

Dirtybase's derive supports:

- `has_one`
- `has_many`
- `belongs_to`
- `has_one_through`
- `has_many_through`
- `morph_one`
- `morph_many`

Use `belongs_to` on the model that stores the foreign key and `has_many` or `has_one` on the related parent model. Through and morph relations are useful when the relationship is mediated by another table or a type column.

## Load related records

For a `User` relation named `posts`, the generated repository exposes methods such as `with_posts` and `with_posts_where`:

```rust
let mut users = User::repo_instance(&manager);
let users = users
    .with_posts()
    .get()
    .await?;
```

Add relation-specific filters with the callback form:

```rust
let mut users = User::repo_instance(&manager);
let users = users
    .with_posts_where(|relation| {
        relation.query_mut().limit(10);
    })
    .get()
    .await?;
```

Related records are mapped back onto the parent model after the parent query completes. For large collections, use relation pagination or a dedicated query instead of loading every related record at once.

## Soft-deleted relationships

If a related model is soft-deletable, the generated relationship query applies the normal deleted-record filter, so deleted children are not attached by default. Relation-specific helpers can include deleted records or return only deleted records when that behavior is enabled for the relation. This prevents deleted related records from appearing unexpectedly in normal responses.

For complex joins, projections, or report-style results, use the [Query Builder](/docs/v1/query-builder) directly.
