# Deployment preparation and operator checklist

Status: the approved Vercel Hobby/Neon Free deployment is live at https://smart-task-project-management-syste-delta.vercel.app. The dedicated PostgreSQL 17 database, scoped runtime role, migrations, private evaluator Admin and authenticated hosted browser workflows have been verified. Details and source IDs are in M5-VERIFICATION.md. The instructions below explain reproduction; new provider actions still follow AGENTS.md.

## Proposed provider settings

Use a personal Vercel Hobby project with the repository root as Root Directory, framework Other, npm ci --include=dev installation, the committed build command and frontend/dist output. Build tools and TypeScript declarations are required even when NODE_ENV=production; explicit --include=dev prevents npm from omitting them during the build. Function runtime still uses production settings. The build generates Prisma and compiles both applications. The root api/index.mjs exports the compiled Express application; API requests route to that function while SPA routes use index.html. A single browser origin preserves the cookie and CSRF model.

Vercel owns function lifecycle: the function entrypoint does not start a port listener or register signal handlers. The standalone server and function share the same runtime composition. One bounded PostgreSQL pool is reused per warm instance and registered with attachDatabasePool. Serverless scaling can still create multiple pools; monitor the actual provider connection/compute limits.

Create a dedicated Neon Free project using PostgreSQL 17 and a nearby compatible region when available. Confirm the actual quotas and no-card flow before creating it. Use a dedicated application role without administrative privileges and a separately controlled migration owner. Never send connection strings in chat. Use TLS verification; do not disable certificate checks to make a connection succeed.

## Production environment names

Ignored .local/vercel-production.env contains only runtime settings and a new session secret. APP_ORIGIN is https://smart-task-project-management-syste-delta.vercel.app, the exact current production origin. Owner migration credentials and evaluator Admin passwords are excluded. Configure runtime secrets for Production only; do not share this file in chat or commit it. A changed domain requires reviewed origin configuration and redeployment, followed by a new CSRF/login check.

| Variable         | Purpose                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------ |
| NODE_ENV         | production                                                                                             |
| DATABASE_URL     | Secret pooled TLS connection for the dedicated hosted application role                                 |
| DIRECT_URL       | Secret direct migration connection; prefer local operator-only use rather than function runtime access |
| SESSION_SECRET   | New random value of at least 64 characters, separate from local/container secrets                      |
| APP_ORIGIN       | Exact final HTTPS origin, without a path or trailing slash                                             |
| TRUST_PROXY_HOPS | 1 only after verifying Vercel's forwarding boundary                                                    |
| LOG_LEVEL        | info or warn; never log credentials                                                                    |

Build-time schema/client generation does not apply migrations. Review the database target, obtain approval, then run db:deploy against its direct connection. Keep TEST_DATABASE_URL local/CI; never point tests at the deployed database. Bootstrap the private evaluator Admin only after approval of that exact hosted target, using locally supplied ADMIN_NAME, ADMIN_EMAIL and a fresh ADMIN_PASSWORD. The local demo seed deliberately refuses arbitrary remote targets.

Preview origins differ from the final production origin. Configure each environment's exact APP_ORIGIN and isolated database access; do not add wildcard origins or send production secrets to untrusted pull-request previews. Avoid enabling Git-driven automatic publication before its approval gate.

## Deployment and verification gate

Before publication, review the actual project name, account, region, source commit, environment scopes and generated HTTPS subdomain with the candidate. Keep Admin credentials private. If a card or paid plan is requested, stop that setup path.

After publishing, verify readiness, secure session cookies, same-origin CSRF-protected login/logout, registration as member only, Admin CRUD, member restrictions including direct API attempts, stored data after refresh, task filters/pagination, overdue notices and nested SPA routes. Inspect browser exceptions and HTTP security headers. Record the actual deployment URL/commit and results in a verification record; local routing/schema checks alone do not establish a working deployment.

Rollback application code to a known successful deployment if required. Do not reset databases or reverse migrations destructively. Current initial migration is additive; future schema changes must remain compatible with the rollback version or receive a reviewed data-migration plan.

## References

- [Vercel function configuration](https://vercel.com/docs/project-configuration/vercel-json)
- [Vercel Express support](https://vercel.com/docs/frameworks/backend/express)
- [Vercel PostgreSQL pooling guidance](https://vercel.com/kb/guide/connection-pooling-with-functions)
- [Neon Free plan](https://neon.com/pricing)
