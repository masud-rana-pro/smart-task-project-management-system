# M2 backend milestone proposal

Status: approved by the candidate after M1 CI passed; implemented and locally verified. See M2-VERIFICATION.md for evidence and remaining delivery checks. No frontend feature implementation or live hosting deployment is authorized by this milestone.

## Scope and resulting behavior

Build the Express REST API on the verified PostgreSQL foundation:

1. Register Team Members; log in/out using PostgreSQL-backed sessions; provide the current user endpoint. Provision Admin through a local setup command rather than public role selection.
2. Add reviewed scrypt password hashing, session regeneration/revocation, HttpOnly cookies, CSRF/origin checks, shared database-backed auth throttling, and validated payloads with field allowlists. Proposed session lifetime: eight hours.
3. Admin project/task CRUD; both roles can read all projects/tasks; members can change only their own assigned task's status. Keep the existing foreign-key protection against deleting projects with tasks.
4. Task filters by project/status/priority/assignee, title/description search, bounded pagination and allowlisted deterministic sorting.
5. Shared-workspace dashboard totals and per-project progress. Dates use Asia/Dhaka calendar semantics; past dates are valid; due today is not overdue; Completed is excluded from overdue totals.
6. In-app overdue notification synchronization, per-user read state and deduplication, with the approved recipient and rescheduling/completion rules. Frontend active polling comes in M3.
7. Repeatable fictional development/demo seed data using locally supplied passwords and a guarded explicit opt-in. No default production credentials or destructive resets.
8. OpenAPI specification and meaningful real-PostgreSQL tests for authentication, sessions, validation, permission boundaries, CRUD/filtering, dashboard counts and notification ownership.

## Verification and delivery

Require passing format/lint/type checks, backend/frontend builds, unit/API tests with no database skips, and migration compatibility with the existing M1 schema. Record actual AI assistance and corrections. Commit coherent verified increments to the supplied repository under the user's GitHub commit/push authorization. Do not rewrite existing history.

Frontend feature screens are M3. Hosting setup/live deployment and paid services are excluded. New dependency installation or external publishing beyond the authorized GitHub pushes still requires separate approval. Explain implementation choices and demonstrate one authenticated API/database operation before milestone signoff.
