# Bright Mind assignment plan

Status: M1 foundation implementation, local dependencies, PostgreSQL service-start attempts, and local Git initialization/foundation commit are approved. M2 feature development and publishing are not approved.
Updated: 24 October 2026. Schedule timezone: Asia/Dhaka.

## Authority and delivery target

The assignment PDF defines the assessment requirements. The invitation email gives a submission deadline of 27 October 2026, overriding the PDF's generic five-day instruction for scheduling purposes. The candidate confirmed an internal completion target of 26 October 2026. Exact completion time is still open.

Source PDF: C:\Users\masud\Downloads\Bright_Mind_Full_Stack_Developer_Assignment.pdf. It is confidential recruitment material; do not commit the original PDF or email without explicit permission. No additional reference link was supplied.

## Confirmed decisions

- Complete every mandatory requirement and all six optional bonus categories.
- React, Node.js, Express REST API, PostgreSQL, Git and GitHub.
- One repository with separate frontend and backend folders.
- Admin manages all projects and tasks. Members see all projects/tasks and can change only the status of their assigned tasks.
- TypeScript is approved for both frontend and backend.
- Proposed GitHub repository name is approved: smart-task-project-management-system; visibility: public. Repository creation/publishing is not yet approved.
- Task deadlines are calendar dates, due through the end of that day in Asia/Dhaka. Past dates are allowed to represent overdue work. Completed tasks are never overdue.
- Block project deletion while it contains tasks; tasks must first be deleted or moved.
- Synchronize overdue notifications when the app opens/refreshes and while active; persist read state and deduplicate by task/deadline. No offline push alerts.
- In-app overdue notifications with an unread indicator; external email is excluded.
- Clean, accessible, responsive business dashboard.
- Free hosting only, no payment card; provider subdomain is acceptable.
- Explain implementation and tradeoffs using the candidate's Java background.
- Obtain approval for each implementation milestone; installations and publishing need separate approval.
- Planning documents and read-only environment/research work are approved.

## Proposed architecture, awaiting approval

Approval update: the user approved the proposed architecture and listed libraries, including React/Vite, Express, Prisma/PostgreSQL, database-backed cookie sessions, and unit/API/browser testing. The root AGENTS.md is activated with explicit approval. Local development will initially use installed PostgreSQL 17; Docker verification is separate. Application implementation, package installation, service starts and Git operations are not yet approved.

Additional approved rules: pending = To Do + In Progress; members receive their assigned overdue task notices and Admins receive all; current overdue lists exclude completed/rescheduled tasks while read state persists for unchanged task/deadline. Task title/description search, pagination and sorting are included.

TypeScript in both applications is approved. Proposed remaining architecture: React with Vite for the browser; Express with route, validation, service, and persistence boundaries. A relational PostgreSQL schema with versioned migrations. Keep one deployable backend rather than introducing microservices.

Proposed repository layout:

```text
frontend/
backend/
docs/
.github/workflows/
README.md
```

Select validation, database access, UI, and test libraries during the architecture approval. Pin compatible versions and commit a lockfile when implementation is authorized. Do not claim that a proposed library is already installed.

Suggested data model: users, projects, tasks, sessions, and notifications. Enforce role and resource permissions in the API, not only in UI controls. Registration must never let the caller select Admin. Provision the initial Admin through a documented secure process.

Proposed authentication: database-backed sessions in HttpOnly cookies, password hashing, server-side logout/revocation, CSRF protection, login throttling, and consistent validation/error handling. Approve this design before implementing it.

## Milestones and evidence

| Gate          | Scope                                                                           | Exit evidence                                                       |
| ------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| M0 Planning   | Requirements, architecture, environment, hosting and GitHub decisions           | Approved decisions and resolved permission/date rules               |
| M1 Foundation | Repository setup, toolchain, database migrations, seed mechanism, CI skeleton   | Clean install, build, migration check; no secrets tracked           |
| M2 Backend    | Authentication, permissions, projects, tasks, filters, dashboard, notifications | API docs and integration tests including unauthorized requests      |
| M3 Frontend   | Auth screens, dashboard, projects/tasks, filters, charts, notifications         | End-to-end core workflow; loading/empty/error and responsive states |
| M4 Hardening  | Security review, unit/integration/E2E tests, containers                         | Passing checks and clean database/container startup                 |
| M5 Deployment | Approved free provider setup, migrations, deployment                            | HTTPS demo and deployed smoke tests                                 |
| M6 Submission | README, one-page AI report, project description, evidence, walkthrough          | Reproduction from a clean checkout and review rehearsal             |

Provisional sequencing: 24 October for M0-M1 and backend start; 25 October for backend/frontend integration and an early approved deployment; 26 October for remaining bonus features, checks, documentation, and rehearsal. This is a target, not a guarantee. Re-estimate after environment/architecture approval. If time is tight, report the risk and ask before changing scope.

## Submission and learning

Deliver source, meaningful real commits, README, migrations and seeds, API documentation, one-page AI Usage Report, and the email's brief project description. Also plan screenshots or a short demo and a 20-minute review rehearsal.

Record AI use as work happens: actual tools, three actual prompts, an actual AI-assisted solution, an actual incorrect/incomplete suggestion, and how it was corrected and verified. Do not invent events or claim AI-generated code was manually authored. Record the candidate's actual decisions, reviews, tests, and explanations separately.

Learning checkpoints: explain request flow, React state, TypeScript types, Express middleware, SQL relationships/migrations, session security, role checks, one API/database operation, and a small feature change.
