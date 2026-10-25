# Candidate learning checkpoints

Use these as explanation prompts before milestone signoff. A generated implementation or passing tests do not prove candidate understanding; record actual explanations/reviews rather than inventing them.

## Request and permission flow

React sends same-origin requests through the Vite development proxy to Express. Express validates input, reads the signed session cookie through the PostgreSQL session store, loads the current user and checks permissions. Prisma performs the database operation and Express sends JSON. This resembles a Java controller/service/repository request path, although Express middleware is composed explicitly.

Why does hiding an Admin button fail to secure an endpoint? Explain how the member status update also checks the assignee in the database update condition.

## State and forms

React Query owns server-data cache; component state owns local interactions such as an open form. React Hook Form and Zod provide immediate form feedback. Backend validation remains authoritative because direct HTTP clients can bypass browser validation.

Explain the observed session cache bug: removing the active session query removed its observer connection, so a successful login did not immediately update the screen. The fix preserves the session query and removes other workspace caches before setting the new identity.

Explain why dashboard code is loaded lazily and why task filter state is represented in the URL. Describe how a mutation invalidates related cached data.

## Credentials and dates

The PostgreSQL login password authenticates the application connection. Application Admin/member passwords authenticate people and are stored as salted hashes. SESSION_SECRET signs session cookies and must be a separate strong random value. No application password or bearer token is saved in browser localStorage.

Explain why a deadline is a PostgreSQL DATE and not a timestamp, why Bangladesh midnight changes the overdue state, and why Completed tasks are excluded.

## Demonstration exercise

Using fictional data: create a project and task as Admin; filter for its assignee; sign in as that member; change the assigned status; explain the resulting dashboard/notification changes. Point to the corresponding API request and database row. Practice explaining a small label/validation change and rerun the relevant checks.
