---
outline: deep
---

# HTTP

Dirtybase provides an Axum-based HTTP layer with named route collections, route groups, middleware, request context, and typed request extractors.

HTTP behavior belongs in an [extension](/docs/v1/extensions). Extensions register routes and middleware before the application enters the runtime. Route collection prefixes and enabled route groups are controlled by [configuration](/docs/v1/configuration).

## Build an HTTP feature

Most features follow this shape:

1. Define handlers in the feature's `http` module.
2. Register those handlers with `RouterManager`.
3. Register any reusable middleware with `WebMiddlewareManager`.
4. Use request extractors and [context](/docs/v1/context) inside handlers.

```rust
impl ExtensionSetup for BlogExtension {
    fn register_routes(&self, manager: &mut RouterManager) {
        manager.api(Some("/blog"), |router| {
            router.get("/posts", list_posts, "blog.posts");
        });
    }
}
```

Continue with [Routing](/docs/v1/routing), [Middleware](/docs/v1/middleware), or [Requests and Responses](/docs/v1/requests).
