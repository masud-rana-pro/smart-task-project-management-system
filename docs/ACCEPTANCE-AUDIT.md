# Acceptance and separation-of-concerns audit

Reviewed 26 October 2026 against the supplied assignment and approved REQUIREMENTS.md. This is evidence of tested behavior, not a promise of an evaluation score or a full security/accessibility certification.

## Structure

Backend HTTP adapters are auth.ts, work.ts and notifications.ts. They parse validated input, invoke authorization middleware and choose responses. services/ owns application operations without Express Request/Response objects. db.ts and Prisma own typed persistence; migrations own database constraints. security.ts owns identity/session/CSRF middleware; runtime.ts composes dependencies; server.ts and api/index.mjs adapt local and hosted startup separately. Services use Prisma directly: an additional generic repository layer was deliberately avoided at this project size. Some infrastructure-specific SQL remains in services for atomic permissions, counts and notification synchronization.

Frontend pages/ owns screens and query/mutation orchestration. components/ owns shared UI and forms; lib/api.ts owns transport and CSRF, lib/session.tsx owns identity/cache transitions, lib/types.ts owns DTOs and date presentation. TanStack Query owns server data. This is a pragmatic layered application, not a claim of strict domain-driven or dependency-inverted Clean Architecture.

The audit found persistence/business operations mixed into backend routes. Commit f7d0cb3 extracted three services while retaining the existing API and permission rules. After extraction, npm run check passed 39 tests (8 frontend, 29 backend, 2 platform-routing), lint, formatting, types and both builds. All eight desktop/mobile Playwright workflows passed; test-results/.last-run.json reported passed with no failed tests. Deployment verification is recorded in M5-VERIFICATION.md.

## Requirement evidence

| Requirement IDs     | Implementation and actual verification                                                                                                                                                                   |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AUTH-01/02          | auth/security/passwords modules; real PostgreSQL api.test.ts covers registration escalation, duplicate emails, session expiry, CSRF, logout and throttling; E2E covers protected screens and role logins |
| PROJ-01             | work service and ProjectsPage; API and browser CRUD, persisted edits, nonempty deletion rejection and final deletion                                                                                     |
| TASK-01/02/03       | task service and TasksPage/TaskForm; API relationships, status/priority validation, PATCH preservation and CRUD; browser creation/edit/status/delete                                                     |
| DATE-01             | dates.ts, validation.ts and browser date helpers; rules.test.ts tests real calendar dates and Dhaka midnight; API checks today/completed/overdue behavior                                                |
| DASH-01             | transactional dashboard counts and DashboardPage; API count assertions; live counts compared with hosted PostgreSQL                                                                                      |
| FILTER-01/SEARCH-01 | task query validation/service and URL-controlled TasksPage; combined filters/search/sort/bounded pagination tested in API and desktop/mobile browser workflows, including reload                         |
| DATA-01             | Prisma schema/migration, FK constraints and isolated database tests; clean container migration and nondestructive seed rerun verified in M4-VERIFICATION.md                                              |
| UI-01               | responsive pages/shared dialogs; desktop/mobile E2E, keyboard skip navigation/focus and selected contrast checks. No claim of a comprehensive WCAG audit                                                 |
| BONUS-01            | backend Admin guards and atomic assigned-task status mutation; direct unauthorized API attacks tested in local and live workflows                                                                        |
| BONUS-02            | notification service and NotificationsPage; recipient isolation, deduplication, ownership/read persistence, completion/rescheduling and reassignment tested                                              |
| BONUS-03            | DashboardPage/Recharts with text counts; completed/total and empty-project calculations tested; live chart rendering checked                                                                             |
| BONUS-04            | Vitest/Testing Library/Supertest plus Playwright; 39 code tests and 8 browser workflows passed after the SoC change                                                                                      |
| BONUS-05            | Dockerfiles/Compose; clean isolated migrations, seed repeat preservation, non-root/read-only containers and browser smoke evidence in M4-VERIFICATION.md                                                 |
| BONUS-06            | Vercel HTTPS application and Neon persistence; actual authenticated deployed workflows and source/deployment IDs in M5-VERIFICATION.md                                                                   |
| DOC-01/02/03        | Genuine incremental Git history; README local/configuration/test instructions; docs/API.md and public OpenAPI endpoint                                                                                   |
| DOC-04/05           | M6 AI Usage Report PDF/editable source and PROJECT-DESCRIPTION.md; visual/page-count verification recorded in FINAL-VERIFICATION.md when completed                                                       |
| REVIEW-01           | WALKTHROUGH.md prepares the candidate's demonstration; candidate rehearsal/understanding has not yet been independently demonstrated                                                                     |

## Limits and open items

Provider subdomain satisfies live-hosting scope. Optional personal masud.root.sx is not active: Vercel requests parent-level _vercel.root.sx verification, and the candidate controls only the subdomain. No FreeDNS record was changed. Final understanding/rehearsal and employer submission remain candidate actions. Hosted fictional verification fixtures are removed after tests; private Admin is preserved and credentials must be shared privately with the evaluator.
