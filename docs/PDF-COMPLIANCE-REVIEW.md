# Assignment compliance review

Submission update: final source cbcfd61 and documentation 2b1aafa have passing CI. M8A's sorting/count/mobile refinements are deployed and live-verified. The candidate subsequently confirmed manual mobile testing complete. The AI report and project description are refreshed for 27 October submission; historical observations below retain their review context. See FINAL-VERIFICATION.md and SUBMISSION.md for the current delivery record.

Reviewed 27 October 2026 against both pages of the original assignment supplied locally by the candidate. The confidential PDF/email are not copied into this repository. This review separates assignment requirements, optional enhancements, historical test evidence and remaining human checks.

## Overall finding

The seven mandatory functional groups, required stack, six optional feature categories and required repository deliverables are implemented with supporting evidence. No missing mandatory application feature was identified in this review. This is not a hiring-score prediction or a claim that automated tests cover every possible defect. Container reproduction evidence comes from M4; the current source was not rebuilt in containers during this read-only review.

Latest reviewed HEAD: 1c7f099. [CI run 40380842393](https://github.com/masud-rana-pro/smart-task-project-management-system/actions/runs/40380842393) passed. The implemented application checks comprise 43 code tests and ten desktop/mobile browser workflows. Deployed stories are recorded in M5-VERIFICATION.md and M7-VERIFICATION.md; user-reported live checks are recorded separately in MANUAL-ACCEPTANCE.md.

## Mandatory functionality - checked individually

| PDF item                                            | Finding                                                 | Evidence reviewed                                                                                                                                                                                          |
| --------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Registration, login, logout, protected pages/API    | Implemented and tested                                  | auth.ts, security.ts, auth-service.ts, SessionProvider/Workspace; API tests check role escalation, duplicate registration, unauthorized access, expiry, CSRF and logout; browser tests exercise both roles |
| Projects: create/list/edit/delete, name/description | Implemented and tested                                  | work.ts/work-service.ts, ProjectsPage/ProjectForm; persisted CRUD, validation, nonempty-delete restriction and empty-delete behavior have API/browser evidence and candidate confirmations                 |
| Tasks: create/list/edit/delete, project/assignee    | Implemented and tested                                  | work service, TasksPage/TaskForm, foreign keys; reference validation, persisted edits, permissions, deletion and candidate manual checks                                                                   |
| Statuses and priorities                             | All three statuses and all three priorities implemented | PostgreSQL enums, strict Zod validation, form/select labels, API and browser tests; omitted PATCH fields retain previous values                                                                            |
| Deadlines and five dashboard totals                 | Implemented and tested                                  | PostgreSQL DATE, Dhaka calendar boundary, real-date validation, completed-task exclusion from overdue, transactional counts and DashboardPage; API count assertions and live database comparisons          |
| Project/status/priority/assignee filtering          | All four implemented together                           | taskQuery/service, URL-based filters; API combined-filter test, browser pagination/search/filter story and candidate manual confirmations                                                                  |
| Database persistence and validation                 | Implemented and tested                                  | PostgreSQL schema/migration, required-field/calendar/relationship validation, server-side authorization, database-backed sessions and isolated PostgreSQL tests                                            |

## Required stack and API compatibility

React/TypeScript/Vite frontend, Node.js/Express/TypeScript REST API, PostgreSQL/Prisma and Git/GitHub match the required technology choices. The API includes registration/login, project/task GET/POST/PUT/DELETE and dashboard routes; PATCH equivalents are also documented. Suggested route names are not treated as additional requirements beyond the PDF's explicitly accepted documented equivalents.

Responsive layouts have automated desktop/mobile evidence. The candidate intentionally deferred hands-on mobile testing; do not label that human check complete. The current narrow-screen task table scrolls internally; a more readable mobile layout is a proposed enhancement.

## Optional features - checked individually

| Bonus                     | Finding                               | Evidence                                                                                                                                           |
| ------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Admin / Team Member roles | Implemented                           | API-enforced Admin CRUD and assigned-member status-only updates; direct unauthorized API tests and candidate checks                                |
| Overdue notifications     | Implemented                           | Persistent recipient/read state, deduplication, active-app synchronization, completed/rescheduled exclusion; API/browser/live and candidate checks |
| Project progress charts   | Implemented                           | Recharts with completed/total text and zero-task handling; count assertions, browser rendering and manual project-progress check                   |
| Unit tests                | Implemented                           | Date/PATCH/password rules and frontend tests, supplemented by real-PostgreSQL integration and browser workflows                                    |
| Containerization          | Implemented; clean run verified at M4 | Dockerfiles, Compose, isolated database/migration/seed, non-root/read-only checks and authenticated smoke evidence in M4-VERIFICATION.md           |
| Live deployment           | Implemented and verified              | Public HTTPS Vercel application, persistent Neon PostgreSQL and deployed browser/API/database verification records                                 |

## Deliverables and responsible AI use

| Deliverable                                 | Finding                                                                                                                                                                                       |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GitHub source and meaningful history        | Separate frontend/backend workspaces and genuine incremental commits are present                                                                                                              |
| README setup/configuration/run instructions | Present, including database, Admin bootstrap, sample data, tests and containers                                                                                                               |
| Schema/migrations and seed instructions     | Present; guarded nondestructive local/container seed and reviewed migration are documented                                                                                                    |
| API documentation                           | Written guide plus OpenAPI 3.1 endpoint/source; M7 Admin reset routes included                                                                                                                |
| One-page AI Usage Report                    | Existing PDF reopened: exactly one page; all five requested topics present, including three explicitly paraphrased real prompts, an AI-assisted problem and a corrected incomplete suggestion |
| Optional screenshots/demo                   | Fictional-data screenshot and working live URL present; a recording is not required                                                                                                           |
| Invitation's brief project description      | Present with technologies, AI assistance, actual candidate contributions/process, challenges and run/test guidance                                                                            |

The AI report is dated 26 October and describes that milestone's 39 code tests/eight workflows. Subsequent Admin reset evidence is 43/ten in M7. Refresh the final report's date/counts after UI work so the submission describes the final revision consistently. Do not invent candidate code authorship or a completed interview rehearsal.

## Specific corrections and next UI scope

1. Manual-acceptance notes were stale at the earlier Member-login interruption; update them to include the candidate's subsequent reset, permissions, notifications, pagination and deletion confirmations.
2. The Tasks dropdown has title A-Z but no Z-A option, although the backend accepts descending title sort. An earlier agent instruction told the candidate to select that absent option; that confirmation cannot establish the missing UI behavior. Add the option and a real browser assertion during the first approved UI step.
3. Result wording currently displays "1 tasks". Correct singular/plural and improve the range summary/pagination clarity.
4. Improve mobile task readability and filter density; the existing internal horizontal table scroll is functional but less convenient than a compact responsive presentation.
5. Keep the current working provider URL. Optional custom-domain verification and candidate hands-on mobile/interview rehearsal remain separate from missing application functionality.

No source, dependency, service or hosted-data changes were made by this read-only audit. Planning/evidence documents were updated locally. UI implementation follows the next milestone approval.

## Approved follow-up: M8A

After this audit, the candidate approved Tasks UI implementation. The local changes add the missing descending-title option, correct singular wording, show result ranges and removable filters, and present mobile task rows as labelled cards. See M8A-VERIFICATION.md for actual checks and release status. The findings above describe the audited baseline; a local correction is not a claim that the production site has already changed.
