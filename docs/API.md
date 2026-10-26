# API walkthrough

The machine-readable OpenAPI 3.1 document is served at `/api/openapi.json` (source: backend/src/openapi.ts). Import that URL into an OpenAPI-compatible API client. Local direct API origin: http://127.0.0.1:3001. Browser application origin: http://127.0.0.1:5173.

## Authentication sequence

1. GET `/api/auth/csrf`. Retain the returned `smart_task.sid` cookie and `csrfToken`.
2. POST `/api/auth/login` with JSON `{ "email": "your local app account", "password": "your local app-login password" }`. Send `Origin: http://127.0.0.1:5173` and `X-CSRF-Token` from step 1, retaining cookies in the client.
3. Retain the **new session cookie and new CSRF token** from successful login. The old session/token are invalidated.
4. GET `/api/auth/me` to verify identity. Responses never include a password hash.
5. Use the current cookie for reads; use both cookie and token plus matching Origin for writes.
6. POST `/api/auth/logout` destroys the server-side session and clears the cookie. Expired/logged-out sessions receive 401.

Registration uses the same CSRF bootstrap, accepts name/email/password (12-128 characters), creates a Team Member and returns 201. It does not automatically log in. The local bootstrap command creates the initial Admin. PostgreSQL login credentials are not application login credentials.

Admin-assisted recovery: GET `/api/auth/members` lists Team Member IDs, names and emails for Admins only. POST `/api/auth/members/{id}/reset-password` accepts `{ "password": "a new private password" }` (12-128 characters), requires the Admin session/Origin/CSRF token, and returns 204. Admin targets are rejected; the member's role, identity and work are preserved. Existing member sessions are revoked, including delayed sessions bearing an old credential fingerprint. Resets are limited to ten per Admin per fifteen minutes. There is no anonymous Forgot Password endpoint or email recovery service. Existing sessions created before this feature require a fresh login after its deployment.

## Routes and permissions

| Operation                    | Route                                                  | Permission                                                         |
| ---------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------ |
| Get CSRF token               | GET /api/auth/csrf                                     | Public; throttled                                                  |
| Register / login             | POST /api/auth/register, /api/auth/login               | Public with anonymous session/token and matching Origin; throttled |
| Current identity / logout    | GET /api/auth/me, POST /api/auth/logout                | Authenticated                                                      |
| Project list/detail          | GET /api/projects, /api/projects/:id                   | Both roles                                                         |
| Project create/update/delete | POST /api/projects; PATCH/PUT/DELETE /api/projects/:id | Admin                                                              |
| Task list/detail             | GET /api/tasks, /api/tasks/:id                         | Both roles                                                         |
| Task create/update/delete    | POST /api/tasks; PATCH/PUT/DELETE /api/tasks/:id       | Admin                                                              |
| Change status                | PATCH /api/tasks/:id/status                            | Admin or assigned member; status is the only accepted field        |
| Assignee list                | GET /api/users/assignees                               | Authenticated roles; id/name only for task assignment/filtering    |
| Dashboard                    | GET /api/dashboard                                     | Both roles; shared workspace                                       |
| Overdue notifications        | GET /api/notifications                                 | Own relevant notices only                                          |
| Mark read                    | PATCH /api/notifications/:id/read                      | Owner only; another user's ID receives 404                         |

Successful creates return 201, reads/updates 200, and deletes/logout/read acknowledgments 204. Nonexistent UUIDs receive 404 where appropriate; malformed IDs receive 400. Foreign-key restrictions protect nonempty projects from deletion (409).

## Request examples

Create project: `{ "name": "Website launch", "description": "Coordinate the release." }`.

Create task:

```json
{
  "title": "Review release checklist",
  "description": "Review the agreed acceptance criteria.",
  "projectId": "PROJECT_UUID",
  "assigneeId": "USER_UUID",
  "status": "TODO",
  "priority": "HIGH",
  "dueDate": "2026-10-26"
}
```

Project/assignee placeholders must be replaced with actual UUIDs. Statuses: TODO, IN_PROGRESS, COMPLETED. Priorities: LOW, MEDIUM, HIGH. Task create defaults to TODO/MEDIUM/empty description when those fields are omitted. PATCH changes supplied fields only and rejects an empty body or unknown fields. PUT requires the editable resource fields and uses the documented create defaults.

Combined task filter example: `/api/tasks?projectId=PROJECT_UUID&status=IN_PROGRESS&priority=HIGH&assigneeId=USER_UUID&search=checklist&page=1&pageSize=20&sortBy=dueDate&sortOrder=asc`.

Empty/unselected filters must be omitted instead of sending empty UUID strings. Page size is 1-100; sortBy allows createdAt, updatedAt, dueDate, title or priority. Equal sort values use UUID as a deterministic tie-breaker. The response includes tasks and pagination (page, pageSize, total, totalPages).

## Date, dashboard and notification behavior

Deadlines are date-only YYYY-MM-DD values, not UTC timestamps. Due today remains on time through the end of that calendar day in Asia/Dhaka. Overdue = deadline before today's Bangladesh date and status not Completed. Pending = TODO + IN_PROGRESS. Progress = rounded completed/total percentage; empty project progress is zero.

GET notifications performs awaited lazy synchronization. Members receive assigned overdue tasks; Admins receive all overdue tasks. Uniqueness prevents repeated notifications for unchanged task/deadline pairs. Completed/rescheduled tasks disappear from the current list; returning to an unchanged overdue deadline retains read state. A different overdue deadline produces a new notice. Reassignment removes previous-member visibility and lets the new assignee receive a notice on their next synchronization. No offline push/background timer is promised.

## Errors and controls

Error shape: `{ "error": { "code": "VALIDATION_ERROR", "message": "Check the supplied fields.", "fields": [{ "field": "dueDate", "message": "..." }] } }`. Never depend on raw database messages.

Login has database-backed 15-minute limits of five attempts per normalized email and thirty per source IP. Registration permits ten per IP; CSRF bootstrap permits one hundred per IP. Responses include Retry-After: 900 when throttled. Proxy trust defaults to disabled; validate the exact hosting chain before allowing one trusted hop. Cookies are HttpOnly/SameSite=Lax and Secure in production; production APP_ORIGIN must use HTTPS.
