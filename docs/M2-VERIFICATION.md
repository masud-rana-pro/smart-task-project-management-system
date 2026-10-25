# M2 backend verification

Verified locally on 25 October 2026. M2 uses the existing M1 database migration; no schema reset or unrelated database changes were required. GitHub CI results must be checked after the implementation push.

## Results

- `npm run check`: passed formatting, ESLint, TypeScript, 2 frontend tests, 22 backend tests and both builds. Backend tests include real PostgreSQL persistence and session storage; no database tests skipped.
- `npm run db:validate` passed; `npm run db:deploy` found no pending migrations on the approved development database.
- Backend API tests cover registration and rejected privilege escalation, login/session rotation/logout/revocation, expiration, CSRF/origin checks, shared login throttling, Admin/member permissions, project deletion restrictions, task references/validation, partial updates, combined search/filters/pagination/sorting, dashboard totals, date semantics and notification ownership/deduplication/read state/rescheduling/reassignment.
- `PLAYWRIGHT_CHANNEL=chrome npm run test:e2e` (set with PowerShell environment syntax on Windows): 2 tests passed on desktop and mobile profiles, with both servers initially stopped. These remain foundation browser-to-API checks. Feature-screen browser coverage belongs to M3.
- An authenticated compiled-server smoke check logged in using locally configured Admin credentials, compared dashboard totals against direct PostgreSQL counts, fetched the OpenAPI document (15 paths) and logged out. Counts matched: 2 projects, 4 tasks, 1 completed, 3 pending, 1 overdue. Counts depend on the date and later demo edits.
- A guarded demo seed rerun preserved existing rows and password hashes. A run without explicit opt-in exited unsuccessfully and left the data unchanged. Credentials stayed local and were not displayed.

## Corrections made during verification

Zod defaults in a partially optional task schema could overwrite omitted fields. Separate create defaults from PATCH validation; a database-backed regression check now verifies omitted status/priority/description remain unchanged.

Playwright repeatedly timed out starting the API through `tsx watch` on this Windows environment, although starting it directly worked. Browser checks now build and start the compiled backend without the development watcher. Fresh startup and both browser profiles passed; no timeout increase was needed.

Unread notices sort ahead of read notices in the bounded latest-notification response, allowing older unread notices to remain reachable as newer ones are read. The unread count covers all current eligible notices.

## Learning checkpoints and limits

The database login password in DATABASE_URL must match PostgreSQL's `smart_task` role password. ADMIN_PASSWORD is an application account password; SESSION_SECRET is a separate random signing secret. Application passwords are stored as salted hashes. URL password characters must be percent-encoded.

An authenticated request loads the current user from PostgreSQL. Backend permissions apply even if someone bypasses the UI. The member status update includes the assignee in its database update predicate, protecting against a concurrent reassignment.

React feature screens, charts, active notification polling, container execution, hosting smoke checks and final submission reports remain pending. No production readiness or complete assignment acceptance is claimed. Free hosting account eligibility and runtime limits still require verification during deployment setup.
