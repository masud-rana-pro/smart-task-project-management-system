# Local container workflow

Status: image downloads, builds, isolated startup, container-only OpenSSL/CA packages and the web-only bridge network were separately approved. Migrations and the fictional seed succeeded on a newly initialized container volume. Container browser smoke checks passed for readiness, security headers, login, task navigation and nested-route refresh. This is a local loopback HTTP demonstration. Live HTTPS hosting is a separate milestone.

## Components and isolation

Base images: `node:24-bookworm-slim`, `postgres:17-alpine`, `nginx:stable-alpine`. Record actual image versions/digests during verification. Builds install from the committed npm lockfile. The API runtime installs backend production dependencies only and runs as the Node user; Nginx runs as its nginx user on port 8080. Both use read-only filesystems, temporary storage and dropped Linux capabilities.

Compose defines project smart-task-demo, a private network, a web-only bridge network and a project-specific PostgreSQL volume/database smart_task_demo. The web-only bridge permits Nginx's loopback port mapping; only Nginx joins both networks. It does not alter the Windows PostgreSQL service or its databases. No database/API port is published; only 127.0.0.1:8080 is exposed. Initialization creates a non-superuser smart_task application role with a password different from the bootstrap superuser.

Startup waits for PostgreSQL readiness, successful migrations and API database readiness before serving the web UI. `/api/health` reports process liveness; `/api/ready` checks a database query. Nginx serves SPA routes and proxies same-origin requests with security headers. One proxy hop is trusted because the API port is private to this network.

## Private configuration and commands

Create random container-only credentials once, without overwriting existing configuration:

```sh
node scripts/prepare-container-env.mjs
docker compose --env-file .local/containers.env config --quiet
```

The ignored .local/containers.env stays outside images and Git. It contains separate database bootstrap/application passwords, a signing secret and fictional account passwords. Expanded `docker compose config` output contains interpolated credentials; use `config --quiet` for validation and do not publish expanded output. Docker administrator access can inspect runtime environment, so this local configuration is not a managed production secret store.

After separate download/build/start approval:

```sh
docker compose --env-file .local/containers.env up -d --build
docker compose --env-file .local/containers.env --profile tools run --rm seed
docker compose --env-file .local/containers.env ps
```

Open http://127.0.0.1:8080. Admin: admin@example.invalid with local CONTAINER_ADMIN_PASSWORD; members: member.one@example.invalid/member.two@example.invalid with CONTAINER_MEMBER_PASSWORD. The preparation script never prints passwords. Seeding requires both opt-ins, non-production mode and the exact db/smart_task_demo target; reruns preserve existing records/passwords.

This loopback HTTP demonstration selects development cookie settings while serving compiled code. HTTPS deployments must use NODE_ENV=production, an HTTPS APP_ORIGIN, Secure cookies and a reviewed proxy chain.

Stop with `docker compose --env-file .local/containers.env down`, which preserves the named volume. Volume removal, `down -v` and database resets require separate approval. Demonstrate fresh installation with a separately approved new Compose project/volume rather than deleting existing data.

## References

See [Compose startup conditions](https://docs.docker.com/compose/how-tos/startup-order/), the [official Node image documentation](https://github.com/nodejs/docker-node), and [psql environment-variable support](https://www.postgresql.org/docs/17/app-psql.html). Initialization quotes the password as a SQL literal rather than interpolating raw SQL.
