# Requirements and acceptance checklist

Status: M1/M2 passed local checks and GitHub CI. M3 frontend workflows and charts are implemented and locally verified (see M3-VERIFICATION.md). The checklist below describes final acceptance: hardening, containers, deployment and final reports remain pending. API tests alone do not complete UI acceptance. Source: the supplied two-page assignment and invitation email. User-selected options are identified below.

| ID        | Requirement                                           | Acceptance evidence                                                                                    |
| --------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| AUTH-01   | Register, login, logout                               | Successful and invalid flows; duplicate registration; logout invalidates access                        |
| AUTH-02   | Protect pages and API endpoints                       | Anonymous requests rejected; protected navigation redirects appropriately                              |
| PROJ-01   | Project create, list, edit, delete; name/description  | CRUD persisted after reload; role checks; deletion policy tested                                       |
| TASK-01   | Task create, list, edit, delete; project and assignee | Valid relationships persisted; missing/nonexistent references rejected                                 |
| TASK-02   | To Do, In Progress, Completed                         | Only allowed statuses accepted by API; UI displays all statuses                                        |
| TASK-03   | Low, Medium, High                                     | Only allowed priorities accepted by API                                                                |
| DATE-01   | Deadlines and invalid-date validation                 | Invalid/calendar edge cases rejected; agreed overdue rule tested                                       |
| DASH-01   | Projects, tasks, completed, pending, overdue totals   | Counts match seeded database and approved visibility rules                                             |
| FILTER-01 | Filter project/status/priority/assignee               | Each filter and combined filters work; reset and no-results states                                     |
| SEARCH-01 | Approved task title/description search                | Case-insensitive text search combines with filters, pagination and sorting                             |
| DATA-01   | Persistent PostgreSQL and validation                  | Migrations work from empty database; repeatable seed; required fields and authorization checked        |
| UI-01     | Responsive React UI                                   | Usable desktop/mobile, keyboard navigation, labels, focus and contrast checks                          |
| BONUS-01  | Admin / Team Member permissions                       | Admin manages all; member access tested against approved matrix                                        |
| BONUS-02  | In-app overdue notifications                          | Correct recipients, unread state, read action, no duplicate notices; agreed timing tested              |
| BONUS-03  | Project progress charts                               | Completed/total calculation correct; empty project handled                                             |
| BONUS-04  | Unit tests                                            | Meaningful business/date/permission tests, plus API integration and core E2E workflows                 |
| BONUS-05  | Containerization                                      | Documented frontend/backend/database container workflow starts cleanly                                 |
| BONUS-06  | Live deployment                                       | Public HTTPS demo, persistent hosted PostgreSQL, documented free-tier limits                           |
| DOC-01    | GitHub and meaningful commits                         | Real incremental commits with accurate descriptions; no fabricated history                             |
| DOC-02    | README                                                | Overview, prerequisites, configuration, installation, migration/seed, run/test, demo and limitations   |
| DOC-03    | API documentation                                     | Routes, authentication, request/response examples, validation and errors                               |
| DOC-04    | One-page AI Usage Report                              | Actual tools, three prompts, problem solved, incorrect suggestion, verification/correction             |
| DOC-05    | Email project description                             | Technologies/tools, AI contribution, candidate contribution/process, challenges, run/test instructions |
| REVIEW-01 | Technical demonstration                               | Explain architecture, API request/database operation, and implement/explain a small change             |

## Business rules requiring approval

1. APPROVED: shared workspace; members see all projects/tasks.
2. APPROVED: members can change only status on their assigned tasks; Admin manages all projects/tasks.
3. New registrations become Team Members; Admin provisioned separately.
4. APPROVED: date-only deadline through end of day in Asia/Dhaka. Pending = To Do plus In Progress. Completed tasks are excluded from overdue counts.
5. APPROVED: allow past deadlines for overdue work; reject malformed or impossible calendar dates.
6. APPROVED: reject project deletion while tasks exist; tasks must be deleted or moved first.
7. APPROVED: synchronize on app open/refresh and while active, persist read state, and avoid duplicate notices for the same task/deadline. Members receive their assigned overdue task notices; Admins receive all. Current overdue lists exclude completed/rescheduled tasks. Preserve read state for unchanged task/deadline. No offline push.
8. APPROVED: task title/description search, pagination and stable sorting alongside all required filters.

## Evaluation weights

Working features/usability 25; React/UX 15; Node/API 20; database/security 15; responsible AI use 15; documentation/GitHub 5; demonstration/explanation 5. These are scoring weights, not a promised result.
