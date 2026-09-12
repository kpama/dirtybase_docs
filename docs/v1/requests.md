---
outline: deep
---

# Requests and Responses

Dirtybase applications use Axum request extractors and response types. Handlers can accept route parameters, query values, headers, JSON, multipart data, and shared application context.

Return an Axum-compatible response from a handler. For API endpoints, use Dirtybase's API response contracts where a consistent response envelope is required.

## Route parameters

Use Axum's `Path` extractor for values captured by a route:

```rust
use axum::extract::Path;

async fn show_post(Path(id): Path<i64>) -> impl IntoResponse {
    format!("post {id}")
}
```

## Query and headers

Use `Query` for query strings and `HeaderMap` for request headers:

```rust
use axum::{extract::Query, http::HeaderMap};
use serde::Deserialize;

#[derive(Deserialize)]
struct Pagination {
    page: Option<u32>,
}

async fn list_posts(
    Query(pagination): Query<Pagination>,
    headers: HeaderMap,
) -> impl IntoResponse {
    // Read pagination and request headers here.
    (pagination.page, headers)
}
```

## JSON and form data

Use `Json<T>` for JSON request bodies and `Form<T>` for URL-encoded form data:

```rust
use axum::extract::Json;
use serde::Deserialize;

#[derive(Deserialize)]
struct CreatePost {
    title: String,
}

async fn create_post(Json(input): Json<CreatePost>) -> impl IntoResponse {
    format!("creating {}", input.title)
}
```

Axum multipart extractors are also available for file and multipart form uploads.

## Request context

Use Dirtybase's context extractors when a handler needs application or request-scoped values:

```rust
use dirtybase_app::contract::app_contract::RequestContext;

async fn dashboard(
    RequestContext(context): RequestContext,
) -> impl IntoResponse {
    format!("request {}", context.id())
}
```

See [Context](/docs/v1/context) for `CtxExt<T>`, optional values, metadata, and resource resolution.

## Responses

Handlers can return strings, HTML, JSON, status codes, tuples, or any other Axum `IntoResponse` type:

```rust
use axum::{http::StatusCode, Json};
use serde::Serialize;

#[derive(Serialize)]
struct Health {
    status: &'static str,
}

async fn health() -> (StatusCode, Json<Health>) {
    (
        StatusCode::OK,
        Json(Health { status: "ok" }),
    )
}
```

For shared API response behavior, use Dirtybase's API response contract from the `dirtybase_contract` crate.
