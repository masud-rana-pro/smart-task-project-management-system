# Smart Task & Project Management System

A React/TypeScript and Node/Express assessment prototype with PostgreSQL persistence planned for the application features.

**Current milestone: M1 foundation.** The frontend shell, API liveness endpoint, database schema/migration files and quality tooling are the initial deliverables. Registration, sessions, permissions, project/task CRUD, dashboard, charts and notifications are not implemented yet. Do not treat the starter as the completed assignment.

## Prerequisites

- Node.js 24.16.x and npm 11.x (project uses npm workspaces).
- PostgreSQL 17 for persistence and migration verification.
- Git. Docker is planned as a separate bonus deliverable.

## Install and run

From the repository root:

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5173 and select **Check API connection**. The frontend proxies `/api` to Express on http://127.0.0.1:3001. No database is required for this liveness check. It does not validate database access. Both dev servers bind to localhost by default.

Individual processes: `npm run dev -w frontend` and `npm run dev -w backend`. To run the compiled API: `npm run build -w backend`, then `npm start -w backend`. `npm run preview -w frontend` previews a static build; it is not the configured full-stack development proxy or production hosting setup.

## Database configuration

Copy `backend/.env.example` to `backend/.env`, then replace the placeholder connection strings with your **isolated project database** credentials. Never commit that file. Do not use an existing unrelated database or a production database.

Database creation and role provisioning must happen before migrations; the commands below do not create the PostgreSQL service/account for you. Use a dedicated development database and an isolated test database whose name ends in `_test`. Database credentials are entered locally, not in chat.

```sh
npm run db:validate
npm run db:generate
npm run db:deploy
```

`db:deploy` applies committed migrations using `DIRECT_URL` (falling back to `DATABASE_URL`). `db:migrate` is for authoring future migrations against a dedicated development database and may require a separate shadow database. Never run `prisma migrate reset` against valuable data.

Runtime connections will use the provider's appropriate pooled URL, with direct access for migrations. Full application persistence and session wiring belong to M2. See [database setup and seed design](docs/DATABASE.md).

## Checks

```sh
npm run check
npm run db:validate
npm run db:generate
```

`check` runs formatting, lint, type checks, unit/API tests, and frontend/backend builds. Database integration tests skip explicitly when `TEST_DATABASE_URL` is absent. Set it to a migrated isolated `_test` database to run them. Skipped tests are not passing database evidence.

Browser tests are prepared but need the Playwright Chromium binary. Install it with `npx playwright install chromium` when that download is approved, then run `npm run test:e2e`. This starts temporary local frontend/API processes for the test. CI provisions isolated PostgreSQL, applies migrations, and runs the checks and browser test. A workflow file is not proof of a successful GitHub run.

If the browser download is unavailable, Playwright can use an already-installed Chrome without changing the normal browser profile. In PowerShell: `$env:PLAYWRIGHT_CHANNEL='chrome'`, then `npm run test:e2e`; afterward `Remove-Item Env:PLAYWRIGHT_CHANNEL`. The suite checks desktop/mobile layouts and saves screenshots under ignored `test-results/`. CI uses Playwright's downloaded Chromium by default.

## API available in M1

`GET /api/health` returns `200 { "status": "ok" }` with no caching. It is a minimal liveness endpoint. Unknown routes return a structured `404`; malformed JSON and oversized JSON bodies return structured `400`/`413` responses. Application/authentication routes and complete OpenAPI documentation come with M2.

## Project layout

```text
frontend/                 Official Vite React/TypeScript starter, adapted for this project
backend/src/              Express app, listener, environment validation and tests
backend/prisma/           Schema and versioned migrations
tests/e2e/                Browser integration test
.github/workflows/        CI definition
docs/                     Requirements, architecture, plans and evidence
AGENTS.md                 Approved project instructions and approval gates
```

## Delivery and attribution

The target is 26 October 2026, Asia/Dhaka, ahead of the invitation's 27 October deadline. The planned public repository name is `smart-task-project-management-system`; no hosting availability or repository publication is implied by this README.

AI assistance: OpenAI Codex assisted requirement analysis, planning, scaffolding integration, code and tests. Official generators created standard starter files. See [AI work log](docs/AI-WORK-LOG.md) for actual contributions and corrections. The final one-page AI Usage Report and candidate contribution statement will be completed using verified work, without invented authorship.
