# M1 foundation verification

Status: code foundation verified after a clean installation; desktop/mobile browser checks passed. Database execution is pending candidate-local credential configuration. No feature-complete assessment or deployment is claimed.

## Implemented scope

- Official Vite React/TypeScript scaffold, adapted to an accessible responsive starter and API connection check.
- npm workspace manifests and a lockfile; stable Prisma 7.10.1 rather than the registry's release candidate.
- Express app/listener separation, bounded JSON parsing, security headers, structured errors and redacted request logging.
- Runtime environment validation, graceful listener shutdown, strict TypeScript compilation and lint/format tooling.
- Prisma schema, generated client workflow and reviewed initial SQL migration for users/projects/tasks/sessions/notifications/auth rate limits.
- Initial frontend/backend tests, a guarded real-database test, browser test infrastructure and a GitHub Actions definition.
- README, database setup instructions, command provenance and factual AI work log.

## Observed evidence

| Check                                             | Observed result                                                           |
| ------------------------------------------------- | ------------------------------------------------------------------------- |
| npm installed dependency tree                     | Valid, no invalid peers reported                                          |
| npm audit during installation                     | Zero known vulnerabilities reported; not a security guarantee             |
| npm ci dry run                                    | Passed; full npm ci also passed (551 packages installed)                  |
| Formatting                                        | Passed                                                                    |
| ESLint                                            | Passed                                                                    |
| Frontend/backend TypeScript                       | Passed                                                                    |
| Frontend/backend tests                            | 7 passed, 1 database test explicitly skipped                              |
| Frontend/backend production build                 | Passed                                                                    |
| Prisma schema validation                          | Passed with explicit prisma.config.ts                                     |
| Prisma client generation                          | Passed, 7.10.1                                                            |
| Migration SQL generation/review                   | Passed offline; project/task FK is ON DELETE RESTRICT                     |
| Compiled API over HTTP                            | 200 with status ok and Cache-Control no-store                             |
| PostgreSQL readiness                              | Service observed running; port 5432 accepts connections                   |
| PostgreSQL authentication/migration/database test | Pending local credentials and setup; not verified                         |
| Playwright Chromium download                      | Failed repeatedly with network resets/DNS errors; cancelled retries       |
| Browser execution                                 | Passed: desktop and mobile using installed Chrome; no horizontal overflow |
| Git exclusions                                    | .env, node_modules, Prisma generated code and build output ignored        |
| GitHub CI/deployment                              | Not executed/published                                                    |

## Learning checkpoint

An Express app is comparable to a configured Spring web application; server.ts starts its HTTP listener. Tests instantiate the app independently and use an ephemeral port. Vite supplies the browser development server and proxies /api to Express. Prisma schema describes database entities; migrations are reviewed SQL changes, and generated client types do not prove database connectivity. Liveness proves that the API responds, while readiness/persistence tests establish separate properties.

## Next scope, not yet authorized

M2 implements registration/login/logout, PostgreSQL-backed sessions and CSRF/throttling, Admin/Member API permissions, projects/tasks/filtering/search/pagination, dashboard calculations, in-app notifications, repeatable fictional seeds, OpenAPI and real-database integration coverage. No M2 implementation or external publishing begins without the next approval.
