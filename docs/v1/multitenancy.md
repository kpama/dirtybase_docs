---
outline: deep
---

# Multitenancy

Multitenancy lets one Dirtybase application serve multiple tenants while resolving the current tenant for each request. The resolved tenant is placed in the request context and can influence configuration, database access, cache prefixes, sessions, authentication, and application behavior.

## When to use multitenancy

Use multitenancy when one application serves separate organizations, workspaces, accounts, or customers that need isolated data and configuration. A tenant should be identified before tenant-specific services or handlers run.

Tenant resolution is not the same as authorization. Resolution answers "which tenant is this request for?" Authentication and [authorization](/docs/v1/authorization) still determine whether the actor may access that tenant.

## Configure multitenancy

Configure the feature with environment variables:

```dotenv
DTY_MULTITENANT_ENABLE=true
DTY_MULTITENANT_STORAGE="memory"
DTY_MULTITENANT_DB_CONFIG_SET="sqlite"
DTY_MULTITENANT_TENANT_REQUIRE=false
```

The equivalent TOML configuration is loaded from `multitenant.toml`:

```toml
enable = true
storage = "memory"
db_config_set = "sqlite"
tenant_require = false
```

The default configuration supports memory and database-backed tenant storage. Use memory for development or a single process; use database storage when tenant records need to be shared and persisted.

## Resolve a tenant

Dirtybase can identify a tenant from an ID or token supplied through a header, query string, or cookie:

| Value | Default location |
| --- | --- |
| Tenant ID | `X-Tenant-ID` header, `tenant-id` query value, or `tenant-id` cookie |
| Tenant token | `X-Tenant-Token` header or `tenant-tk` query value |

For example, an API request can identify its tenant with:

```http
GET /api/projects
X-Tenant-ID: 018f2f6e-6e6d-7b1c-8f8e-1d8d7f0a1234
X-Tenant-Token: tenant-secret
```

All names are configurable:

```dotenv
DTY_MULTITENANT_HEADER_KEY="X-Workspace-ID"
DTY_MULTITENANT_TOKEN_HEADER_KEY="X-Workspace-Token"
DTY_MULTITENANT_QUERY_KEY="workspace-id"
DTY_MULTITENANT_TOKEN_QUERY_KEY="workspace-token"
DTY_MULTITENANT_COOKIE_KEY="workspace-id"
```

## Require a tenant

Set `tenant_require` to reject requests that do not resolve a tenant:

```dotenv
DTY_MULTITENANT_TENANT_REQUIRE=true
```

Leave it disabled when the application has both global and tenant-aware routes. Global routes can be used for tenant selection, health checks, or platform administration; tenant routes should verify that a tenant is present before accessing tenant data.

## Tenant context

After resolution, Dirtybase stores a `TenantContext` in the current [Context](/docs/v1/context):

```rust
if let Some(tenant_context) = context.tenant_context().await {
    if tenant_context.has_tenant() {
        println!("tenant {}", tenant_context.tenant_name());
    }
}
```

The context exposes the tenant ID, tenant name, whether it is global, the resolved tenant model, and tenant-specific configuration values. A global tenant context is used when no tenant has been selected and tenant resolution is not required.

## Tenant-specific configuration

Tenant configuration values are checked before application configuration when resolving configuration through context:

```rust
let config = context
    .get_config_once::<FeatureConfig>("feature")
    .await?;
```

This lets the same application use different settings per tenant while keeping the feature's configuration code unchanged. See [Configuration](/docs/v1/configuration) for application-level TOML and environment settings.

## Tenant-aware resources

Dirtybase resource managers can use the current tenant as part of their resource identity. The built-in cache resource manager, for example, resolves resources using the tenant context so cache values can be separated by tenant.

When creating application resources, include the tenant identity in the resource key or cache prefix where isolation is required:

```rust
let tenant = context
    .tenant_context()
    .await
    .expect("tenant context is required");

let cache = context.get::<CacheManager>().await?;
let tenant_cache = cache.prefix(&format!("tenant:{}", tenant.id_as_string())).await;
```

Do not rely on a tenant identifier supplied by the client alone for data isolation. Resolve and validate the tenant through Dirtybase's tenant storage, then scope database queries and service resources to the resolved context.

## Tenant resolution hooks

`TenantResolvedMiddleware` provides a middleware chain that receives the resolved `Tenant`. Extensions can use it to add behavior after resolution and before tenant-specific work:

```rust
let middleware = TenantResolvedMiddleware::get().await;

middleware
    .next(|tenant, next| async move {
        // Observe or validate the resolved tenant.
        next.call(tenant).await
    })
    .await;
```

Keep feature-specific tenant behavior in an [extension](/docs/v1/extensions), and use the [application lifecycle](/docs/v1/lifecycle) to understand when contexts and extensions are initialized.

## Tenant model

Dirtybase includes a soft-deletable `Tenant` model with an ID, name, token, optional domain, status, and timestamps. Tenants can be looked up by ID, name, token, or domain. Use the database and ORM guides when managing tenant records:

- [Database](/docs/v1/database)
- [Models](/docs/v1/orm/model)
- [Repositories](/docs/v1/orm/repository)

## Multitenancy and authentication

Resolve the tenant before applying tenant-scoped authorization. An authenticated actor may belong to several tenants, so the current tenant should be part of the authorization decision rather than inferred only from the actor. Continue with [Authentication](/docs/v1/authentication) and [Authorization](/docs/v1/authorization).
