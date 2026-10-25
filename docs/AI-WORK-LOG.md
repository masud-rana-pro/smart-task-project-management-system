# AI assistance work log

This is a factual working log, not the final one-page report. The final report must describe completed work and verification. Do not invent candidate implementation work or incorrect suggestions to meet the assignment format.

## Tool and contributions

OpenAI Codex read the assignment, extracted requirements, conducted multiple-choice planning interviews, drafted architecture/acceptance documents and integrated the M1 scaffolding, schema and initial tests. Vite/npm/TypeScript/Prisma CLIs generate the standard skeleton where applicable. The candidate selected PostgreSQL, TypeScript approval, permissions, notification behavior, date semantics, public repository naming, and approval gates. These decisions are candidate contributions; do not claim the candidate manually wrote AI-generated files.

## Actual prompt excerpts for the final report

1. "Before doing development i want to plan appropriately as industrial way" - requested planning, prerequisites, GitHub/free hosting and confirmation gates.
2. "ask me these quiations as interview in multiple choice questions" - established the decision interview workflow.
3. "reduse the project skeliton creation by command" - requested official scaffolding commands rather than manually creating every starter file.

Preserve these as excerpts and replace/add implementation prompts later if more useful for the final report.

## Actual issues and corrections

- Initial npm command combined a text package name with `--json`, causing a JSON parse error. Split text and boolean configuration into separate npm commands and verified generated manifests. No claim that a failed command succeeded.
- npm's default Prisma tag resolved to an 8.0 release candidate. Selected the stable 7.x major and matching client/adapter instead. Verify the final installed versions from the lockfile.
- Patch integration attempted delete/add operations on the same file; the patch tool rejected that format. Switched to a batch project-configuration script for the generator outputs. File access under the sandbox also required authorized execution outside it.
- PostgreSQL startup attempts were denied by Windows. Kept API liveness separate from database readiness so the application cannot falsely claim database success.

## Verification

Initial results: formatting, ESLint, TypeScript checks, both production builds, two frontend tests and five backend tests passed. One real-database test skipped because no TEST_DATABASE_URL was configured. Prisma 7.10.1 validated the schema and generated the client. SQL was generated with migrate diff and reviewed for constraints; it has not yet been applied locally. A full clean npm ci passed; the final check pipeline passed again. Two Playwright browser tests passed using installed Chrome on desktop/mobile profiles, and screenshots were visually reviewed. The dedicated Chromium download failed with network resets/DNS errors, so it was not used. AI-generated code remains subject to review and tests. Candidate learning checkpoints: explain app versus server separation, Vite's /api proxy, npm workspaces, schema/migrations, and why liveness is not database readiness.

The latest form resolver (6.x) produced a real optional-peer conflict between Effect versions. Corrected by selecting compatible @hookform/resolvers 5.9.2; installed dependency tree is valid without --force or --legacy-peer-deps. npm audit reported zero known vulnerabilities at installation time; this does not prove the application is secure.

Prisma init attempted an additional automatic skills step. Stopped that step, retained only the project database starter, explicitly selected prisma.config.ts in commands, and excluded empty tool-specific agent directories. No global agent settings were changed.

On 25 October 2026, verified local connection URL target restrictions and authentication without displaying credentials. Applied the initial migration to both empty approved databases and reran all frontend/backend tests: eight passed, zero skipped. The candidate supplied the GitHub repository and authorized appropriate commits/pushes. No credentials were added to version control.

## M2 implementation, 25 October 2026

The candidate approved M2 after foundation CI passed and then requested continuation. Codex implemented the authentication, sessions, validation, role-protected APIs, dashboard calculations, notifications, guarded seed/Admin CLI, API documentation and PostgreSQL tests. The candidate provisioned the isolated database role/databases locally and selected the business rules; no claim is made that the candidate manually wrote this generated implementation.

Reviewed password hashing against the OWASP Password Storage Cheat Sheet and session behavior against express-session documentation. Used Node scrypt with per-password salts, database-backed sessions and shared atomic login counters. Runtime/session pools share a bounded PostgreSQL pool.

Actual correction: applying defaults to a partially optional Zod task schema could reset omitted PATCH fields. Split create defaults from update fields and added a regression test. Fixed TypeScript strict optional-field handling and Express request augmentation after lint/type checks reported problems. Playwright's Windows development watcher startup stalled; changed E2E startup to the compiled API and verified both fresh-start browser profiles successfully.

Actual results: full formatting/lint/type/test/build pipeline passed with 24 unit/API tests (22 backend and 2 frontend), zero skips; two foundation browser tests passed using installed Chrome. An authenticated compiled-server dashboard check matched direct database counts. Guarded seed reruns preserved records/password hashes, and missing opt-in was rejected without changes. See M2-VERIFICATION.md. Feature frontend and deployment validation remain future work.

## M3 implementation, 25 October 2026

The candidate approved M3 conditional on M2 CI success; run 40149096934 succeeded. Codex implemented the React interface, forms, query/session integration, dashboard chart, filters and notification views with existing approved dependencies. Both roles can read minimal assignee IDs/names for the approved filter; a PostgreSQL API test verifies no email/password fields are exposed.

Browser tests exposed an incorrect AI implementation: clearing the full query cache on login removed the active session observer, leaving the login screen visible after API success. Preserved the session query while removing other workspace caches, then verified the member workflow and added a component regression for login/logout notifications. Select labels containing option text also caused an exact test locator mismatch; switched tests to accessible combobox roles. The initial build flagged a large bundle; split dashboard/chart loading from sign-in.

Actual results so far: 5 frontend tests and 23 backend tests passed; all 8 real PostgreSQL desktop/mobile browser workflows passed. Visually inspected desktop/mobile screenshots. Browser fixtures use unique fictional rows, scoped cleanup and TEST_DATABASE_URL; development data is not used by the suite. No new dependencies or external publishing beyond the approved GitHub work were needed. The candidate has not yet been recorded as demonstrating these workflows; see LEARNING-CHECKPOINTS.md.
