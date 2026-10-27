# Smart Task & Project Management System

Built for the Bright Mind Ltd. Full-Stack Developer assignment by Md. Masud Rana.

Smart Task brings projects, assignments and deadlines into one shared workspace. Administrators organize work, while team members track and update the tasks assigned to them. The application pairs a responsive React interface with an Express API and PostgreSQL persistence.

The React interface and API implement registration/login/logout, PostgreSQL sessions, Admin/Team Member permissions, project/task CRUD, filtering/search/pagination, dashboard/progress charts and in-app overdue notifications. All six optional feature categories are implemented. See the [acceptance audit](docs/ACCEPTANCE-AUDIT.md) and verification records for tested coverage and limitations.

**Live demo:** https://smart-task-project-management-syste-delta.vercel.app. Public registration creates a Team Member; evaluator Admin credentials are shared privately. Fictional demonstration data may be present. [Submission index and deliverables](docs/SUBMISSION.md).

## Contents

1. [Features and access](#features-and-access)
2. [Technology stack](#technology-stack)
3. [Evaluator walkthrough](#evaluator-walkthrough)
4. [Prerequisites](#prerequisites)
5. [Install and run](#install-and-run)
6. [Database configuration](#database-configuration)
7. [Admin and fictional sample data](#admin-and-fictional-sample-data)
8. [Checks](#checks)
9. [API documentation](#api-documentation)
10. [Local containers](#local-containers)
11. [Project layout](#project-layout)
12. [Delivery and attribution](#delivery-and-attribution)

## Features and access

| Area           | Included behavior                                                                            |
| -------------- | -------------------------------------------------------------------------------------------- |
| Authentication | Registration, login/logout, PostgreSQL-backed cookie sessions                                |
| Projects       | Create, view, edit and delete; nonempty projects are protected from deletion                 |
| Tasks          | Project and assignee, title/description, three statuses, three priorities, calendar deadline |
| Task discovery | Combined project/status/priority/assignee filters, text search, sorting and pagination       |
| Overview       | Project/task totals, completed/pending/overdue counts, progress charts                       |
| Notifications  | Persistent in-app overdue notices with read/unread state                                     |
| Administration | Server-enforced permissions and Admin-assisted Member password reset                         |
| Delivery       | Automated tests, Docker Compose, GitHub CI and hosted demo                                   |

Admins manage projects and tasks. Members see shared work and can change only the status of their own assigned tasks. Public registration never grants Admin access. Deadlines run through the end of the selected calendar day in Asia/Dhaka; completed tasks are excluded from overdue counts.

## Technology stack

| Layer                          | Technologies                                                        |
| ------------------------------ | ------------------------------------------------------------------- |
| Interface                      | React 19, TypeScript, Vite, React Router, CSS                       |
| Data and forms                 | TanStack Query, React Hook Form, Zod, Recharts                      |
| API                            | Node.js 24, Express 5, TypeScript, Prisma                           |
| Persistence and authentication | PostgreSQL 17, pg, database-backed sessions, salted scrypt          |
| Verification                   | Vitest, Testing Library, Supertest, Playwright, ESLint, Prettier    |
| Delivery                       | Git/GitHub, GitHub Actions, Docker/Compose, Vercel Hobby, Neon Free |

Exact versions and dependency resolution are recorded in package-lock.json.

## Evaluator walkthrough

1. Open the live demo and sign in with the privately supplied Admin account.
2. Review Overview totals and project progress. Open Projects and create a clearly named evaluation project.
3. Create a task in that project, assign it to the supplied Member and choose a status, priority and deadline.
4. Test combined filters, search, sorting and pagination on Tasks. Refresh to check filter persistence.
5. In a separate private browser window, sign in as the Member. Verify visibility of shared work and update the assigned task's status; administrative controls are unavailable.
6. Set an incomplete task's due date to a previous day as Admin. Check overdue totals and relevant notifications, then mark a notice read. Completing the task removes it from current overdue results.
7. Try an empty required field and an attempt to delete a project that still has tasks. Confirm the application explains both cases.
8. For the optional reset enhancement, use a separate disposable Member account. An Admin reset revokes that member's existing sessions; avoid changing the supplied evaluator account during the general walkthrough.
9. Review the source, OpenAPI specification, migrations and test records linked below. Remove only the evaluation data you created when finished.

Use browser developer tools to review API requests, or import the live OpenAPI JSON into a compatible API client. A short review can follow the request path: React form → API client → Express handler/security → application service → Prisma → PostgreSQL.

## Prerequisites

- Node.js 24.16.x and npm 11.x (project uses npm workspaces).
- PostgreSQL 17 for persistence and migration verification.
- Git. Docker Desktop/Engine with Compose is optional for the container workflow.

## Install and run

Clone the repository, then work from its root:

```sh
git clone https://github.com/masud-rana-pro/smart-task-project-management-system.git
cd smart-task-project-management-system
```

Install the locked dependencies:

```sh
npm ci
npm run db:generate
```

Configure the environment and database below, then run `npm run dev`. Open http://127.0.0.1:5173 and sign in using a locally provisioned application account, or register a Team Member. The frontend proxies `/api` to Express on http://127.0.0.1:3001. The liveness endpoint does not query the database; application features require a migrated PostgreSQL database. Both dev servers bind to localhost by default. Use `127.0.0.1` consistently so the configured origin and cookies match.

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

Admins can open **Member access** to reset a Team Member password after confirming their identity directly. The new password is entered twice; existing member sessions end. Admin accounts cannot be reset from this screen. There is no public, verification-free password recovery endpoint. Share replacement credentials privately. On rollout of this feature, existing sessions need a fresh login because sessions now carry an internal credential fingerprint.

Set ADMIN_NAME, ADMIN_EMAIL and a unique ADMIN_PASSWORD locally, then run `npm run admin:create`. This creates an Admin if absent; it does not promote an existing member or reset an existing password. Public registration always creates Team Members.

For sample data in the approved local smart_task_dev database, also set DEMO_MEMBER_PASSWORD to a different strong password. In PowerShell:

```powershell
$env:ALLOW_DEMO_SEED = 'true'
npm run db:seed
Remove-Item Env:ALLOW_DEMO_SEED
```

The non-destructive seed creates two projects, four tasks, and members `member.one@example.invalid` and `member.two@example.invalid`. Existing records/passwords are preserved. These **application login passwords are separate from the PostgreSQL password**. No real credentials or default working passwords are published. Passwords use salted scrypt; sessions are stored in PostgreSQL and expire after eight hours.

## Checks

Before the first test run, apply the committed migrations to the isolated test database too. The earlier `npm run db:deploy` targets the development database; setting TEST_DATABASE_URL alone does not migrate the test database. In a separate PowerShell terminal, replace the example below with the same isolated test connection configured as TEST_DATABASE_URL in backend/.env. URL-encode the real password locally:

```powershell
$env:DIRECT_URL = 'postgresql://smart_task:YOUR_URL_ENCODED_DB_PASSWORD@127.0.0.1:5432/smart_task_test'
try {
  npm run db:deploy
} finally {
  Remove-Item Env:DIRECT_URL
}
```

Use a database whose name ends in `_test`. Removing this temporary override restores normal loading of the development DIRECT_URL from backend/.env on subsequent commands. The tests create and clean their own fictional fixtures; no demo seed is needed for the test database.

```sh
npm run check
npm run db:validate
npm run db:generate
```

`check` runs formatting, lint, type checks, unit/API tests, and frontend/backend builds. Database integration tests skip explicitly when `TEST_DATABASE_URL` is absent. Set it to a migrated isolated `_test` database to run them. Skipped tests are not passing database evidence.

Browser workflows need a Playwright Chromium binary or installed Chrome. Install Chromium with `npx playwright install chromium` when that download is approved, then run `npm run test:e2e`. Stop any API using port 3001 first: the suite intentionally starts its own compiled API against TEST_DATABASE_URL and creates/removes only its fictional fixtures. It never reuses a development API. Ten desktop/mobile workflows cover roles, CRUD, filters, sorting, pagination, notifications, registration, password reset/session revocation, logout and keyboard skip navigation. CI provisions isolated PostgreSQL, applies migrations, and runs the checks and browser workflows. The final application passed 43 code tests and all ten browser workflows; see [final verification](docs/FINAL-VERIFICATION.md) for the corresponding CI and deployment evidence.

If the browser download is unavailable, Playwright can use an already-installed Chrome without changing the normal browser profile. In PowerShell: `$env:PLAYWRIGHT_CHANNEL='chrome'`, then `npm run test:e2e`; afterward `Remove-Item Env:PLAYWRIGHT_CHANNEL`. The suite checks desktop/mobile layouts and saves screenshots under ignored `test-results/`. CI uses Playwright's downloaded Chromium by default.

## API documentation

Open http://127.0.0.1:3001/api/openapi.json for the OpenAPI 3.1 specification, or see the [API walkthrough](docs/API.md). Get a CSRF token and session cookie before login/registration; send the matching Origin and X-CSRF-Token on mutations. Login rotates both session and token. Browser API calls should use the frontend's same-origin proxy.

`GET /api/health` returns `200 { "status": "ok" }`; it reports only liveness. `GET /api/ready` queries PostgreSQL and returns 200 when ready or 503 when unavailable. Errors use `{ "error": { "code": "...", "message": "...", "fields": [] } }` (fields is optional). Invalid inputs return 400; unauthenticated/forbidden access 401/403; missing/conflicting records 404/409; oversized payloads 413; throttled authentication 429.

## Local containers

See [the container workflow](docs/CONTAINERS.md) for isolated PostgreSQL, automatic migrations, guarded fictional seeds and the compiled web/API at http://127.0.0.1:8080. Credentials stay in an ignored local file. The API/database ports remain private. This loopback HTTP demonstration is separate from live HTTPS deployment.

The deployed application uses one Vercel HTTPS origin with Neon PostgreSQL. See [deployment instructions](docs/DEPLOYMENT.md) and [M5 verification](docs/M5-VERIFICATION.md). The candidate used Hobby/Free accounts without a payment card. Free-tier quotas, cold starts and provider availability apply; this is an assessment demo without an uptime SLA. Notifications synchronize in-app and do not deliver offline push/email. No account upgrades or extra paid services are required by this project.

## Project layout

```text
frontend/src/             React pages, forms, session/API integration and components
backend/src/              HTTP handlers, security, runtime, database access and tests
backend/src/services/     Authentication, work and notification application operations
backend/prisma/           Schema and versioned migrations
tests/e2e/                Browser integration test
.github/workflows/        CI definition
docs/                     Requirements, architecture, plans and evidence
AGENTS.md                 Approved project instructions and approval gates
```

## Delivery and attribution

Prepared for submission on 27 October 2026, Asia/Dhaka, following the earlier 26 October completion target. Source: [GitHub repository](https://github.com/masud-rana-pro/smart-task-project-management-system). Use the working HTTPS provider URL above for the demonstration.

AI assistance: OpenAI Codex assisted requirement analysis, planning, scaffolding integration, implementation, tests and documentation. Official generators created standard starter files. Most code/tests were AI-assisted; candidate decisions/setup are attributed separately. See the [AI work log](docs/AI-WORK-LOG.md), [one-page report](output/pdf/AI-Usage-Report.pdf), [editable report](docs/AI-USAGE-REPORT.md) and [project description](docs/PROJECT-DESCRIPTION.md). The [walkthrough](docs/WALKTHROUGH.md) prepares the candidate's explanation; reading it does not establish completed rehearsal or understanding.
