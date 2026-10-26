# M5 preparation verification

Status: preparation CI, hosted database setup and approved evaluator Admin bootstrap passed on 26 October 2026. The candidate created Vercel Hobby and Neon Free accounts and the dedicated Neon project. Public application deployment remains pending separate approval.

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

Diff/secret review passed before commit d84def2; [GitHub CI run 40221183618](https://github.com/masud-rana-pro/smart-task-project-management-system/actions/runs/40221183618) succeeded. Platform route handling, TLS database connectivity and deployed browser behavior require an approved preview/publication target; local checks cannot prove them.

## Account and publication gates

The candidate created Vercel Hobby and Neon Free accounts privately and reported both ready on 26 October. They created Neon project bright-mind-smart-task in AWS Singapore, PostgreSQL 17, production default branch, bright_mind_db owned by bright_mind_db_owner. Their subsequent "proceed" approved this target's application-role and migration setup. Admin credentials must remain private for direct evaluator sharing. GitHub/provider connections, hosted application Admin bootstrap and publication still require separate approval. Stop any path requesting a card or paid plan.

## Hosted database evidence

- Owner direct TLS connection verified, with exact database/role and an empty initial public schema.
- smart_task_app created through SQL with random password stored only in ignored .local/neon-app.env; no administrative role was granted.
- node scripts/neon-database.mjs migrate: committed migration deployed successfully, exit 0; no reset/seed.
- Grant transaction passed for SELECT/INSERT/UPDATE/DELETE on the six application tables. Public-schema CREATE was revoked from PUBLIC in this dedicated database.
- Pooled TLS login as smart_task_app passed. Verified no administrative flags, public-schema CREATE or migration-table SELECT, and all four DML privileges on every required table. No application data written by verification.
- Initial endpoint guard rejected the additional c-2 hostname segment; corrected before any database mutation. Corrected pooled-host generation to place -pooler on the first DNS label.
- Proposed Vercel function region is now explicitly sin1 (Singapore), matching the database; this configuration has not yet been deployed.

## Approved evaluator account

The candidate separately approved a private Bright Mind Demo Admin account, admin@example.invalid. Bootstrap used the existing compiled Admin CLI against the exact pooled runtime target, without changing existing account passwords. A random password is saved only in ignored .local/hosted-admin.env. A database lookup verified ADMIN role and the application's scrypt verifier confirmed the stored password hash matches the private password. No email was sent; no credentials or hashes were displayed. Deployed browser login remains to be verified after publication.

The candidate also approved GitHub/Vercel connection limited to masud-rana-pro/smart-task-project-management-system and opening Import configuration. That approval excludes pressing Deploy; the candidate is receiving manual setup instructions.

## First Vercel build failure

The candidate imported the runtime environment and proceeded with the first deployment after requesting and receiving the deployment go-ahead. Vercel built main at 86ebf5a, but production NODE_ENV caused plain npm ci to omit dev dependencies. The frontend could not resolve vite/client, @vitejs/plugin-react and vitest/config; backend compilation could not resolve its TypeScript declarations. Updated the platform install command to npm ci --include=dev. CI's install step now uses that command with NODE_ENV=production so the build-tool dependency regression is covered. Runtime production behavior remains unchanged.

Local clean reproduction with NODE_ENV=production passed npm ci --include=dev (zero known advisories), Prisma client generation and both builds, exit 0. Fix f1d5f79 was pushed; GitHub's Vercel status confirms a new deployment is running. Public runtime smoke checks remain pending the actual deployment URL and successful deployment.

## Initial public runtime checks

Vercel reported f1d5f79 deployed successfully; [GitHub CI run 40255156649](https://github.com/masud-rana-pro/smart-task-project-management-system/actions/runs/40255156649) also passed. The candidate's screenshot confirms the assigned domain https://smart-task-project-management-syste.vercel.app (syste, not system). HTTPS checks passed: /api/ready 200 ready, /api/auth/csrf 200 JSON with Secure cookie, /api/projects 401 JSON, /login 200 application HTML. The initially proposed system.vercel.app domain returned DEPLOYMENT_NOT_FOUND and was not used for credentialed tests.

The local deployment file now uses the confirmed domain. Vercel APP_ORIGIN still requires candidate correction and redeployment before authenticated browser/CSRF workflows can be verified. Do not call deployment verification complete based only on these initial checks.

After the candidate supplied a subsequent deployment-success screenshot, the browser smoke run could not find the login form. Rechecking showed that both the previously working syste.vercel.app alias and the initially proposed system.vercel.app alias now return Vercel DEPLOYMENT_NOT_FOUND. The smoke run stopped before submitting credentials or creating fixture accounts/projects/tasks. The latest Visit URL is requested; authenticated workflow verification remains incomplete. The private evaluator Admin was preserved.

The next screenshot confirms the current production alias https://smart-task-project-management-syste-delta.vercel.app. Readiness returns 200 ready. An anonymous mutation probe with a matching session token and the current Origin returns 403 CSRF_REJECTED, confirming the deployed origin setting still does not match this alias. No evaluator password was submitted in that probe. Local configuration now uses this alias; the candidate must update Production APP_ORIGIN and redeploy the existing project before authenticated checks proceed.

## Connected-provider origin repair and routing regression

After the user requested direct assistance, Windows browser control failed without changing settings. The candidate installed the Vercel connection and approved its team access. The connector verified the project/domain, updated only the existing Production APP_ORIGIN and redeployed the same reviewed production source as dpl_ABeZZhbTDHihJ1HEVxZc7jZyU9ZG. That deployment became READY. Live API Admin login 200, session lookup 200 and logout 204 then passed.

The live browser run passed desktop Admin login and mobile registration/member permission checks, then found task listing 400: strict validation rejected the Vercel rewrite's injected path query metadata. The root deployment adapter now removes only this reserved routing field from the request URL/preparsed query. Other unrecognized application query fields remain available for strict backend rejection. Two dedicated regression tests passed; compiled adapter readiness/security smoke passed. The failed live run's UUID-tagged test project/tasks/member and captured sessions were removed; evaluator Admin preserved. Full code checks and redeployment are in progress before retrying the complete live workflow.
