# M1 foundation approval proposal

Status: approved and in verification. Local dependency installation, PostgreSQL service-start attempts, and local Git initialization/foundation commit were separately approved. Browser binary download was subsequently approved. Database creation and M2 features are not yet approved.

## Concrete scope

Create npm workspaces with frontend/ and backend/, TypeScript configurations, React/Vite starter shell, Express app/listener separation and a minimal health route. Configure formatting, linting, type checking, build scripts, initial test infrastructure, safe .env.example placeholders, .gitignore and README setup notes. Create Prisma schema and reviewed initial SQL migration for users/projects/tasks/sessions/notifications plus shared authentication-rate-limit storage. Use a seed/admin setup design without committed production passwords. Prepare GitHub Actions with a disposable PostgreSQL test service.

No project/task/authentication feature implementation in this milestone; those belong to the next approval. No external deployment or hosting account creation. Git repository initialization and commits have a separate approval below.

## Separate dependency installation approval

Install the architecture's selected npm dependencies and dev dependencies locally in this project, generating lockfiles. Inspect current compatible versions and package metadata first. Do not install global tools or unrelated plugins. Browser binary downloads for Playwright are separate from the initial npm dependency installation and can be approved when browser tests are ready.

## Separate local database approval

Start the existing postgresql-x64-17 service, then perform a readiness check. Do not alter existing database contents, accounts, passwords or server configuration. Database creation and migration execution require established access and an approved isolated target; never use a destructive reset on existing data. Prefer dedicated development and test databases, with a least-privileged project login. If administrative permission or credentials are needed, stop and explain the specific next action; never ask the user to paste passwords into the interview.

## Separate local Git approval

Initialize a local repository on main, inspect the configured author identity without modifying global configuration, review staged paths for secrets/confidential documents, and create one accurate foundation commit only after the scoped checks pass. No GitHub creation or push is included. If identity is missing, ask for the desired identity before committing.

## Evidence required

Clean dependency installation; formatting/lint/typecheck; frontend/backend production build; health-route check and basic API test. Review the migration SQL. Execute empty-database migration verification only if database access and target creation are approved and available. Report a missing database check as unverified, never passed. Record actual results, learning notes and the next milestone proposal.
