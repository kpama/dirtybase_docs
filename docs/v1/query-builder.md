---
outline: deep
---

# Query Builder

Dirtybase includes database query builders for selecting, filtering, ordering, joining, and paginating records. The builders are designed to work with the framework's model and repository abstractions while retaining SQLx as the database layer.

## Where queries belong

Use repositories to keep query construction out of HTTP handlers and to make database access reusable across application services.

```rust
pub struct UserRepository;

impl UserRepository {
    pub async fn active_users(&self) -> Result<Vec<User>, DbError> {
        // Build and execute the query here.
        todo!()
    }
}
```

Keep handlers focused on HTTP concerns and let repositories return application models or database errors. See [Requests and Responses](/docs/v1/requests) and [Repositories](/docs/v1/orm/repository) for the surrounding layers.

## Query capabilities

The database builders support the common operations needed by application features:

- Select records and specific columns.
- Add conditions and combine filters.
- Order results and paginate them.
- Join related tables.
- Execute database-backed model queries.

## Query builder or ORM?

The query builder and ORM solve different problems. The ORM starts with a model: it represents a table-backed domain object and provides a natural place for model behavior, relationships, and persistence rules. The query builder starts with a question: it constructs the database query needed to return a particular result.

Use the ORM when:

- The result represents one of your application's models.
- You need the model's relationships or repository behavior.
- You are creating, updating, or loading a domain object.
- The same model behavior is reused across multiple features.

Use the query builder when:

- The result is a projection rather than a complete model.
- A page combines columns from several tables through joins.
- You are building an aggregate, report, dashboard, or search query.
- You need query-specific filters, ordering, or pagination.
- Hydrating a model would add behavior or data that the endpoint does not need.
- The query does not map cleanly to a single model or relationship.

For example, a user detail page is a good ORM concern because it loads a user and its relationships. A report showing each team's name, member count, and latest activity is a query-builder concern because the result is a purpose-built projection across multiple tables.

The query builder does not replace the ORM. A repository can use either abstraction and expose a focused method to the rest of the application:

```rust
pub struct TeamReportRepository;

impl TeamReportRepository {
    pub async fn summary(&self) -> Result<Vec<TeamSummary>, DbError> {
        // Use joins, aggregates, ordering, and pagination for this report.
        todo!()
    }
}
```

Keep that database-specific construction in the repository, then let an HTTP handler serialize the result. This keeps the [HTTP layer](/docs/v1/http) independent of query details while preserving the ORM for model-oriented features.

See [Models](/docs/v1/orm/model), [Repositories](/docs/v1/orm/repository), and [Relationships](/docs/v1/orm/relationship) for the model-centered side of the database layer.
