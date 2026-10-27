# Project description

Smart Task & Project Management System | 27 October 2026

Smart Task is a shared project and task workspace with registration/login/logout, PostgreSQL-backed sessions, project/task CRUD, assignment, status/priority/deadlines, combined filtering/search/pagination, dashboard totals and project progress charts. Admins manage work; members view all work and change only the status of their assigned tasks. Overdue notifications persist unread/read state and synchronize while the application is active.

## Technologies and tools

React and TypeScript with Vite, React Router, TanStack Query, React Hook Form, Zod, Recharts and CSS; Node.js/Express/TypeScript, Prisma and PostgreSQL 17; salted scrypt password hashing and cookie sessions. Git/GitHub, GitHub Actions, Vitest, Testing Library, Supertest, Playwright, Docker/Compose, Vercel Hobby and Neon Free support development, testing and hosting. Exact dependency versions are reproducible from package-lock.json.

## Contributions and process

I used OpenAI Codex for requirements analysis, planning, implementation, testing, deployment support and documentation. Official generators created standard starter files. Most application code and tests were generated or edited with AI assistance; the one-page AI Usage Report explains that contribution.

My work included choosing PostgreSQL and deciding the role permissions, Dhaka deadline rules, notification behavior and interface direction. I set up the isolated local databases, entered credentials locally, created the hosting accounts and Neon project, connected the repository and performed the initial Vercel deployment steps. I reviewed milestone proposals, manually tested the application on desktop and mobile, and requested the final architecture and requirements checks.

Work proceeded through foundation, backend, frontend, hardening/containers, hosted verification and final documentation. Routes, services, persistence, security and runtime composition have separate responsibilities. Versioned migrations and database constraints complement request validation; permissions are enforced by the API. Later refinements added Admin-assisted member password reset and a clearer Tasks screen with descending title sorting, removable filters, pagination summaries and mobile task cards.

## Implementation challenges

Deployment needed care because production dependency installation and Vercel routing differ from the local server. The build now explicitly installs its required tooling, and a small provider adapter handles routing metadata before API validation. Container setup includes Prisma's OpenSSL requirements and Nginx's temporary directories. The final architecture review moved application operations into backend services, keeping HTTP handling separate from business logic and database access. These changes were checked through static analysis, database tests and browser workflows.

## Running and testing

Follow README.md for Node 24/npm 11, isolated PostgreSQL credentials, npm ci, client generation, committed migrations and npm run dev. Public registration creates only members; provision an Admin locally through npm run admin:create. Guarded sample seeds and Docker reproduction are documented separately. npm run check runs static checks, tests and builds; real database tests need TEST_DATABASE_URL, and npm run test:e2e runs desktop/mobile workflows. Never point automated tests at the hosted database.

The final application revision passed 43 automated code tests, ten desktop/mobile browser workflows, static checks and production builds. GitHub CI and live verification also passed. I completed manual testing, including mobile use; this is recorded separately from the automated results.

Source: https://github.com/masud-rana-pro/smart-task-project-management-system

Live demo: https://smart-task-project-management-syste-delta.vercel.app

Evaluator Admin credentials are supplied privately. The application uses Vercel Hobby and Neon Free; provider quotas and cold starts apply. SUBMISSION.md indexes the setup guide, API documentation, schema, seed instructions and verification evidence.
