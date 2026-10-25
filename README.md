# Smart Task & Project Management System

A React/TypeScript and Node/Express task-management assessment prototype with PostgreSQL persistence.

**Current milestone: M2 backend.** The API implements registration/login/logout, PostgreSQL sessions, Admin/Team Member permissions, project/task CRUD, filtering/search/pagination, dashboard/progress calculations and in-app overdue notifications. The React application is still the M1 starter; feature screens, charts, containerization and live hosting are upcoming milestones. This is not yet the completed assignment.

## Prerequisites

- Node.js 24.16.x and npm 11.x (project uses npm workspaces).
- PostgreSQL 17 for persistence and migration verification.
- Git. Docker is planned as a separate bonus deliverable.

## Install and run

From the repository root:

```sh
npm ci
npm run db:generate
```

Configure the environment and database below, then run `npm run dev`. Open http://127.0.0.1:5173 and select **Check API connection**. The frontend proxies `/api` to Express on http://127.0.0.1:3001. The liveness endpoint does not query the database; application features require a migrated PostgreSQL database. Both dev servers bind to localhost by default. Use `127.0.0.1` consistently so the configured origin and cookies match.

Individual processes: `npm run dev -w frontend` and `npm run dev -w backend`. To run the compiled API: `npm run build -w backend`, then `npm start -w backend`. `npm run preview -w frontend` previews a static build; it is not the configured full-stack development proxy or production hosting setup.

## Database configuration

Copy `backend/.env.example` to `backend/.env`, then replace the placeholder connection strings with your **isolated project database** credentials. The URL password must match the PostgreSQL login, with special characters URL-encoded. Generate a separate SESSION_SECRET of at least 64 random characters and set APP_ORIGIN to the browser application's exact origin. Never commit that file. Do not use an unrelated database.

Database creation and role provisioning must happen before migrations; the commands below do not create the PostgreSQL service/account for you. Use a dedicated development database and an isolated test database whose name ends in `_test`. Database credentials are entered locally, not in chat.

```sh
npm run db:validate
npm run db:generate
npm run db:deploy
```

`db:deploy` applies committed migrations using `DIRECT_URL` (falling back to `DATABASE_URL`). `db:migrate` is for authoring future migrations against a dedicated development database and may require a separate shadow database. Never run `prisma migrate reset` against valuable data.

Runtime database/session access shares one bounded PostgreSQL pool. Hosted runtime access should use the provider's appropriate pooled URL, with direct access for migrations. See [database setup and seed instructions](docs/DATABASE.md).

## Admin and fictional sample data

Set ADMIN_NAME, ADMIN_EMAIL and a unique ADMIN_PASSWORD locally, then run `npm run admin:create`. This creates an Admin if absent; it does not promote an existing member or reset an existing password. Public registration always creates Team Members.

For sample data in the approved local smart_task_dev database, also set DEMO_MEMBER_PASSWORD to a different strong password. In PowerShell:

```powershell
$env:ALLOW_DEMO_SEED = 'true'
npm run db:seed
Remove-Item Env:ALLOW_DEMO_SEED
```

The non-destructive seed creates two projects, four tasks, and members `member.one@example.invalid` and `member.two@example.invalid`. Existing records/passwords are preserved. These **application login passwords are separate from the PostgreSQL password**. No real credentials or default working passwords are published. Passwords use salted scrypt; sessions are stored in PostgreSQL and expire after eight hours.

## Checks

```sh
npm run check
npm run db:validate
npm run db:generate
```

`check` runs formatting, lint, type checks, unit/API tests, and frontend/backend builds. Database integration tests skip explicitly when `TEST_DATABASE_URL` is absent. Set it to a migrated isolated `_test` database to run them. Skipped tests are not passing database evidence.

Browser tests are prepared but need the Playwright Chromium binary. Install it with `npx playwright install chromium` when that download is approved, then run `npm run test:e2e`. This starts temporary local frontend/API processes for the test. CI provisions isolated PostgreSQL, applies migrations, and runs the checks and browser test. A workflow file is not proof of a successful GitHub run.

If the browser download is unavailable, Playwright can use an already-installed Chrome without changing the normal browser profile. In PowerShell: `$env:PLAYWRIGHT_CHANNEL='chrome'`, then `npm run test:e2e`; afterward `Remove-Item Env:PLAYWRIGHT_CHANNEL`. The suite checks desktop/mobile layouts and saves screenshots under ignored `test-results/`. CI uses Playwright's downloaded Chromium by default.

## API documentation

Open http://127.0.0.1:3001/api/openapi.json for the OpenAPI 3.1 specification, or see the [API walkthrough](docs/API.md). Get a CSRF token and session cookie before login/registration; send the matching Origin and X-CSRF-Token on mutations. Login rotates both session and token. Browser API calls should use the frontend's same-origin proxy.

`GET /api/health` returns `200 { "status": "ok" }`; it reports only liveness. Errors use `{ "error": { "code": "...", "message": "...", "fields": [] } }` (fields is optional). Invalid inputs return 400; unauthenticated/forbidden access 401/403; missing/conflicting records 404/409; oversized payloads 413; throttled authentication 429.

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

The target is 26 October 2026, Asia/Dhaka, ahead of the invitation's 27 October deadline. Source: [GitHub repository](https://github.com/masud-rana-pro/smart-task-project-management-system). Live hosting is not yet deployed.

AI assistance: OpenAI Codex assisted requirement analysis, planning, scaffolding integration, code and tests. Official generators created standard starter files. See [AI work log](docs/AI-WORK-LOG.md) for actual contributions and corrections. The final one-page AI Usage Report and candidate contribution statement will be completed using verified work, without invented authorship.
