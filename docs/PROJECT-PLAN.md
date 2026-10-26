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
- GitHub repository: smart-task-project-management-system; visibility: public. The candidate supplied the repository and authorized appropriate commits/pushes. Live application publishing requires separate approval.
- Task deadlines are calendar dates, due through the end of that day in Asia/Dhaka. Past dates are allowed to represent overdue work. Completed tasks are never overdue.
- Block project deletion while it contains tasks; tasks must first be deleted or moved.
- Synchronize overdue notifications when the app opens/refreshes and while active; persist read state and deduplicate by task/deadline. No offline push alerts.
- In-app overdue notifications with an unread indicator; external email is excluded.
- Clean, accessible, responsive business dashboard.
- Free hosting only, no payment card; provider subdomain is acceptable.
- Explain implementation and tradeoffs using the candidate's Java background.
- Obtain approval for each implementation milestone; installations and publishing need separate approval.
- Planning documents and read-only environment/research work are approved.

## Approved architecture and original planning record

Approval update: the user approved the proposed architecture and listed libraries, including React/Vite, Express, Prisma/PostgreSQL, database-backed cookie sessions, and unit/API/browser testing. The root AGENTS.md is activated with explicit approval. Local development uses installed PostgreSQL 17. M1-M4 implementation, scoped dependency installation, service starts and Git operations were subsequently approved; see their milestone records. Hosting remains a separate gate.

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

## 25 October 2026 checkpoint

M1 and M2 passed local checks and GitHub CI. The candidate provisioned the isolated login/databases and configured credentials locally. The candidate approved M3 conditional on M2 CI passing; that condition was met for commit 5d1d68e. M3 now has 28 passing unit/API tests and eight passing local desktop/mobile browser workflows; final M3 verification and GitHub CI evidence are recorded separately. The candidate authorized commits/pushes to https://github.com/masud-rana-pro/smart-task-project-management-system.git. Hosting deployment is not authorized yet.

## 26 October 2026 checkpoint

M3 CI succeeded. Approved M4 changes were locally verified with 35 passing unit/API tests, eight passing browser workflows and successful isolated container migration, seed and authenticated browser smoke checks, then pushed as 957046a. GitHub CI status is tracked in M4-VERIFICATION.md. M5 deployment preparation is proposed in M5-DEPLOYMENT-MILESTONE.md and awaits approval; account actions, additional installations and live publishing remain separate gates. Candidate learning demonstration and final submission documents remain outstanding.

## Final 26 October checkpoint (supersedes earlier gate status)

M4's corrected CI passed, M5 preparation/provider actions and publication were subsequently approved, and the HTTPS application is deployed with verified hosted workflows. The candidate requested a SoC/requirement audit and approved M6 conditional on correcting gaps. The audit extracted backend services and passed local/deployed regressions; see ACCEPTANCE-AUDIT.md and M5-VERIFICATION.md, including the recorded documentation-formatting CI failure and correction. Final deliverables are indexed in SUBMISSION.md. Candidate technical rehearsal/employer submission remain separate human actions. Optional masud.root.sx is blocked by parent-domain TXT verification; the provider URL remains the working submission address.
