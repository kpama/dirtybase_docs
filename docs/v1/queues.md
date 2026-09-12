---
outline: deep
---

# Queues and Cron

Dirtybase includes an early queue contract and a scheduler for recurring jobs. Cron is currently the more complete of the two services; the queue package provides the interfaces that future connectors and workers can implement.

## Queues

The queue contract is built around a connector that can fetch, enqueue, and delete jobs:

```rust
pub trait Connector {
    fn fetch(&self) -> i32;
    fn put(&self, job: i32);
    fn delete(&self, job: i32);
}
```

The current queue manager is only a marker contract and does not yet provide a complete high-level dispatch or worker API. Treat queues as an extension point for application-specific connectors rather than a ready-to-use background job system.

## Cron configuration

Cron jobs are configured through `cron.toml` or `DTY_CRON_*` environment variables:

```dotenv
DTY_CRON_ENABLE=true
DTY_CRON_JOBS.cleanup.ENABLE=true
DTY_CRON_JOBS.cleanup.SCHEDULE="0/10 * * * * * *"
DTY_CRON_JOBS.cleanup.DESCRIPTION="Remove expired records"
DTY_CRON_JOBS.cleanup.ARGS="users,30"
```

The equivalent TOML configuration is:

```toml
enable = true

[jobs."cleanup::expired"]
enable = true
schedule = "every 10 minutes"
description = "Remove expired records"
args = "users,30"
```

Cron accepts standard cron expressions and the English cron syntax supported by the framework's parser. A job must be enabled both at the top-level configuration and in its job configuration to run as intended.

## Schedule a job

Create a `CronJob` with a job ID, schedule, and async handler:

```rust
let job_context = CronJob::schedule(
    "every 10 minutes",
    |context| {
        Box::pin(async move {
            // Perform the scheduled work.
            context.done().await;
        })
    },
    JobId::from("cleanup::expired"),
)
.await?;
```

The handler receives a `JobContext`, which identifies the job and can signal completion. Jobs run asynchronously under Tokio and may be controlled after they are scheduled.

## Control cron jobs

The cron CLI exposes commands for starting, running, stopping, ending, and exiting jobs:

```sh
cargo run -p cli -- cron start
cargo run -p cli -- cron run cleanup::expired
cargo run -p cli -- cron stop cleanup::expired
cargo run -p cli -- cron end cleanup::expired
cargo run -p cli -- cron exit
```

`stop` pauses a scheduled job without removing it. `end` stops and removes it from the scheduler. `exit` stops all running jobs.

## Register cron through an extension

The cron package is registered during standard application setup. Application-specific jobs should be created or configured by an [extension](/docs/v1/extensions), allowing them to participate in the [application lifecycle](/docs/v1/lifecycle) and shutdown behavior.

Use [Configuration](/docs/v1/configuration) for environment and TOML precedence, and [Context](/docs/v1/context) when a job needs application services or tenant-aware resources.
