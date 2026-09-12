---
outline: deep
---

# Cache

Dirtybase provides a typed cache manager with configurable storage. Cache values are serialized as JSON, keys can be scoped with prefixes, and entries can be invalidated individually or by tag.

## Why use the cache?

Use the cache when a value is expensive to calculate or fetch but can safely be reused for a period of time. Typical examples include rendered dashboard data, frequently read settings, authorization lookups, API responses, and results of repeated queries.

The cache should accelerate access to data, not become the authoritative source of that data. Keep durable application state in the database, then invalidate or expire cached copies when the underlying state changes. Use the memory store for fast, process-local caching; choose a shared store when multiple application instances need to read the same cached values.

## Configure the cache

Select a cache storage in environment configuration:

```dotenv
DTY_CACHE_STORAGE="memory"
```

The cache configuration is also available through `cache.toml`:

```toml
storage = "memory"
```

The cache package supports memory and database stores. Use memory for a single process or development, or database storage when a shared backend is required.

The cache extension is registered during normal application setup. It registers a context resource manager, so cache managers are resolved for the current application or tenant context.

## Resolve a cache manager

Resolve `CacheManager` from a Dirtybase context:

```rust
let cache = context
    .get::<CacheManager>()
    .await?;
```

The manager is context-aware and can be used from extensions, services, middleware, and handlers. See [Context](/docs/v1/context) for typed resource resolution.

## Store and retrieve values

Values must implement `Serialize` when writing and `DeserializeOwned` when reading:

```rust
cache.put("dashboard", &dashboard, None).await;

let dashboard: Option<Dashboard> = cache.get("dashboard").await;
```

`put` stores or replaces a value. `add` stores a value only when the key does not already exist:

```rust
let inserted = cache.add("lock", true, None).await;
```

Use `has` to check for an entry, `forget` to delete one entry, and `pull` to read and delete an entry in one operation:

```rust
if cache.has("dashboard").await {
    let _: Option<Dashboard> = cache.pull("dashboard").await;
}

cache.forget("dashboard").await;
```

## Remember values

`remember` returns the cached value or evaluates a fallback, stores the result, and returns it:

```rust
let dashboard: Dashboard = cache
    .remember("dashboard", None, || async {
        Dashboard::load().await
    })
    .await;
```

Use `remember_forever` when the value should not expire:

```rust
let settings = cache
    .remember_forever("settings", || async {
        Settings::load().await
    })
    .await;
```

## Expiration

For the memory and database stores, the expiration argument is an optional Unix timestamp. A positive timestamp makes the entry cold after that point; `None` keeps it without an expiration:

```rust
let expires_at = cache.now().timestamp() + 600;
cache.put("short-lived", &value, Some(expires_at)).await;
```

Expired entries are treated as cache misses by `get`, `many`, and `remember`.

## Prefixes

Use a prefixed manager to keep keys for a feature or tenant separate:

```rust
let user_cache = cache.prefix("users").await;
user_cache.put("42", &user, None).await;
```

The manager prefixes and hashes the final key before passing it to the storage backend. Callers can continue using short, feature-local keys without collisions with other prefixes.

## Tags

Tags let related entries be invalidated together:

```rust
let posts = cache.tags(&["posts", "home"]).await;
posts.put("featured", &featured_posts, None).await;
posts.put("recent", &recent_posts, None).await;

posts.flush_tags(&["posts"]).await;
```

`flush_tags` removes entries associated with the specified tags. Use tags for feature-level invalidation, such as clearing all post caches after a post is published.

## Counters and batches

The manager supports numeric increments and decrements as well as batch reads and writes:

```rust
cache.put("views", &0, None).await;
cache.increment_by("views", 1.0).await;
cache.decrement("views").await;
```

Use `many` and `put_many` when a feature needs multiple cache values in one operation.

## Flush behavior

`flush` clears the cache store. Prefer `forget` or `flush_tags` in application code so one feature does not invalidate unrelated data:

```rust
cache.flush_tags(&["posts"]).await;
```

Cache managers are context resources and are cleaned up with the application resource lifecycle. See [Application Lifecycle](/docs/v1/lifecycle) and [Configuration](/docs/v1/configuration).
