---
outline: deep
---

# Sessions

Sessions store state across HTTP requests. Dirtybase keeps the session data in a configured storage backend and sends a session identifier to the client in a cookie. The session contents remain server-side.

## When to use sessions

Use a session for state that belongs to a browser or request flow, such as:

- The authenticated browser session.
- A post-login redirect target.
- A shopping cart or multi-step form.
- Flash messages and short-lived preferences.

Use the [Cache](/docs/v1/cache) for reusable application data and the [Database](/docs/v1/database) for durable domain data. Sessions are scoped to a client and should not be treated as an application's source of truth.

## Configure sessions

Session configuration is loaded from `session.toml` and `DTY_SESSION_*` environment variables:

```dotenv
DTY_SESSION_STORAGE="memory"
DTY_SESSION_LIFETIME=120
DTY_SESSION_COOKIE_ID="dty_session"
DTY_SESSION_LOTTERY="2,200"
```

The lifetime is configured in minutes. The lottery value is a pair of numbers used by session cleanup; `2,200` represents a 2-in-200 cleanup chance.

The session package currently provides dummy, memory, and database storage implementations. Use memory for development and single-process applications. Use database storage when sessions must survive restarts or be shared by multiple application instances.

The equivalent TOML configuration is:

```toml
storage = "memory"
lifetime = 120
cookie_id = "dty_session"
lottery = "2,200"
```

See [Configuration](/docs/v1/configuration) for environment-file loading and TOML overrides.

## Session lifecycle

The standard application setup registers the session extension. During extension setup it loads the session configuration and registers the session resource manager. When a request context is created, Dirtybase:

1. Reads the session ID from the request cookie.
2. Resolves the session data from the configured storage.
3. Validates the session fingerprint and expiration.
4. Creates a new session when the existing session is invalid.
5. Refreshes the session lifetime for a valid session.
6. Attaches the session cookie to the response.

Session setup is part of the [application lifecycle](/docs/v1/lifecycle), and response cookie handling is performed by the session extension.

## Read and write session data

Resolve the current `Session` from the request context and store serializable values by key:

```rust
let session = context.get::<Session>().await?;

session.put("return_to", "/account").await;
let return_to: Option<String> = session.get("return_to").await;
```

Use `remove` to delete one value:

```rust
session.remove("return_to").await;
```

Values are serialized as JSON, so the type used with `get` must match the value written with `put`.

## Save and delete sessions

Changes are persisted with `save`:

```rust
session.save().await;
```

Delete the stored session when it should no longer exist:

```rust
session.clone().delete().await;
```

Use `invalidate` when rotating the session, such as after login or logout. It removes the old session and creates a fresh session while preserving the request fingerprint:

```rust
let session = session.invalidate(&context).await;
```

## Session cookies

Dirtybase creates a cookie with the configured session ID name and lifetime. The cookie is attached to the response by the session extension. Application cookie security is configured under `[web_cookie]` or with `DTY_APP_WEB_COOKIE_*` settings:

```dotenv
DTY_APP_WEB_COOKIE.HTTP_ONLY=true
DTY_APP_WEB_COOKIE.SECURE=true
DTY_APP_WEB_COOKIE.SAME_SITE="lax"
```

For production, use secure cookies over HTTPS and keep the cookie HTTP-only unless client-side JavaScript must read it.

## Sessions and authentication

Sessions and authentication are related but separate. Authentication resolves an actor; a session provides the state used to remember a browser across requests. See [Authentication](/docs/v1/authentication) for actors, credentials, guards, and token-based API flows.
