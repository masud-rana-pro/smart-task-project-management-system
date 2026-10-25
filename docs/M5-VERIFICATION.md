# M5 preparation verification

Status: local code/configuration preparation passed on 26 October 2026; GitHub CI pending. No accounts, hosted database or public deployment exist yet.

M4 passed GitHub CI on 2754bc8, run 40219897500, satisfying the candidate's condition for starting M5.

## Changes

- Shared runtime composition between standalone Express and the Vercel function adapter; standalone signal handling remains in server.ts.
- Root function entrypoint reuses a bounded PostgreSQL pool and attaches the provider lifecycle helper. PostgreSQL continues to own sessions, login counters and notification state.
- Draft same-origin API/SPA routing, static security headers, deployment file exclusions and operator instructions.
- Real PostgreSQL runtime tests for readiness, unauthenticated protection and production Secure cookies behind the configured proxy.

## Dependency correction

The candidate approved @vercel/functions 3.10.3 and Vercel CLI 65.2.0 downloads. The CLI introduced 35 reported dependency vulnerabilities, including a critical tar advisory, and was removed before use or login. Provider-dashboard setup replaces that optional CLI path. No global CLI was installed.

The function helper initially brought a pinned vulnerable Zod dependency through @vercel/cli-config. A scoped root override selects the already-used Zod 4.6.7. Workspace-local installation did not apply that override; placing the provider adapter dependency in its owning repository root resolved the graph. npm ls confirms the patched dependency; npm install and npm audit --omit=dev report zero known vulnerabilities. This is an audit result, not proof of application security.

## Local results

- npm run check passed formatting, lint, type checks, 8 frontend tests, 29 backend tests and both builds.
- Compiled root function-entrypoint smoke check passed database readiness, unauthenticated API protection and production Secure-cookie issuance against the isolated test database; exit code 0 after resource cleanup.
- A temporary smoke helper initially forced process exit and triggered a Windows libuv assertion. Corrected the helper to close the server/session store/database through an internal lifecycle hook, then reran successfully. This is recorded separately from the passed HTTP assertions.
- npm ls reports the intended Zod 4.6.7 override; npm audit --omit=dev reports zero known vulnerabilities. The optional CLI is absent from the final dependencies.
- All eight desktop/mobile browser workflows passed against the shared standalone runtime in 1.5 minutes, exit code 0. Final formatting check passed.

## Remaining verification

Final diff/secret review and GitHub CI. Platform route handling, TLS database connectivity and deployed browser behavior require an approved preview/publication target; local checks cannot prove them.

## Account and publication gates

The candidate has neither Vercel nor Neon accounts. Admin credentials must remain private for direct evaluator sharing. Account creation/connections, the exact hosted database and its migration/bootstrap, and the exact publication target each need separate approval. Stop any path requesting a card or paid plan.
