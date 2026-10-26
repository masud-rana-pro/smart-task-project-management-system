# Candidate walkthrough and learning checkpoint

Prepared material is not a completed candidate rehearsal. Use the private Admin login; do not screen-share password files or provider environment values.

## Twenty-minute review

1. Minutes 0-5: log in as Admin, create a project and assigned task, edit it, show filters/search, dashboard and chart. Demonstrate rejection of deleting a nonempty project.
2. Minutes 5-8: use a separate browser session as member; show all shared work, change assigned status, show hidden management controls and explain server enforcement. Show an overdue notice, mark read and reload; complete the task and show it disappears.
3. Minutes 8-13: trace browser -> lib/api.ts -> Express middleware -> route -> service -> Prisma -> PostgreSQL -> JSON -> query cache/render. Discuss schema foreign keys and committed migrations.
4. Minutes 13-17: explain sessions/CSRF, password hashing, role guards, date-only deadlines and tests. Open a relevant regression and explain its failure condition.
5. Minutes 17-20: explain how to add a small validated field or filter through schema/migration, API validation/service, browser form/types, documentation and tests. Do not modify the hosted schema during a demonstration without review.

## Java comparisons

- Express routers resemble controllers; services hold application operations. Prisma resembles a typed ORM/persistence API, while PostgreSQL enforces relations and transactions.
- runtime.ts is a small composition root, serving a role similar to explicit dependency wiring. This application does not use a Spring-style dependency injection container.
- TypeScript types are compile-time checks; Zod validates untrusted runtime input, comparable to request DTO validation. Neither replaces database constraints.
- A session cookie identifies server-stored state; React's role display is not authorization. Every protected API request reloads its identity/permissions from trusted server state.
- React pages/components render state, TanStack Query synchronizes server data, and form state remains local. An API mutation invalidates affected queries instead of manually maintaining several copies.

## Questions to answer in your own words

Why can't registration select Admin? Why do both a session cookie and CSRF protection matter? Why is 2026-10-26 a DATE rather than a browser UTC timestamp? Why does project deletion fail while tasks exist? Why can a member not bypass permissions by calling the API directly? What did the deployment regression test catch? Which parts did Codex write, and what did you personally decide or configure?

Record an actual rehearsal only after performing it. Do not claim interview readiness from reading this guide alone. Keep the evaluator password private; the repository contains instructions, not working credentials.
