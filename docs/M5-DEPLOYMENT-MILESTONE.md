# M5 deployment proposal

Status: candidate approved code/configuration preparation on 26 October, conditional on M4 CI success; that condition was met by run 40219897500 on 2754bc8. Local @vercel/functions 3.10.3 and Vercel CLI 65.2.0 downloads are separately approved. Neither provider account exists yet. Admin credentials must remain private for direct evaluator sharing. Account creation, provider connections, hosted database changes and publishing each need their concrete separate approval.

## Proposed deployment

Use Neon Free PostgreSQL and Vercel Hobby for this personal assessment demo, with a provider HTTPS subdomain and no payment card. Neon currently explicitly advertises a no-card Free plan. Vercel Hobby is free for personal non-commercial use; confirm eligibility and the actual signup flow before proceeding. If either service requests a card or paid plan, stop that setup path and present an alternative.

Prefer one browser origin for React assets and /api requests so the existing cookie/CSRF design continues to work. Prepare reviewed Vercel routing/build configuration and an Express function entrypoint, with the existing frontend/backend folders preserved. Validate the supported static-asset/function arrangement before publishing. Do not replace the application stack or convert it to a different framework.

Reuse one bounded PostgreSQL pool per warm function instance and integrate Vercel's attachDatabasePool lifecycle helper if the final adapter uses Fluid compute. That helper is a proposed new dependency and requires separate installation approval. Keep database-backed sessions, authentication counters and notification state; do not rely on function memory for persistent state.

Use pooled TLS database connections for runtime and a direct migration connection. Keep the database and API in compatible nearby regions where available on the free plans. Review the actual free quotas and provider restrictions during setup. Free quotas and scale-to-zero can affect availability/first-request latency; this is a demo rather than an uptime commitment.

## Work and expected evidence

1. Prepare and review deployment configuration, environment-variable names, pool lifecycle and production HTTPS settings. Run relevant local checks before account/publishing steps.
2. After concrete account approval, guide candidate sign-in/verification without requesting passwords in chat. Confirm Free/Hobby, no card, project ownership, region and repository access scope.
3. After approval of the exact new hosted database, apply reviewed migrations and bootstrap fictional demo accounts through a guarded documented process. Do not reuse local passwords or weaken the existing local seed guard to accept arbitrary remote databases.
4. After approval of the exact publication target, deploy the reviewed application. Keep credentials out of Git, browser bundles and logs. Use production Secure/HttpOnly/SameSite cookies and an exact HTTPS APP_ORIGIN.
5. Verify HTTPS readiness, registration/login/logout, role restrictions, CRUD, persistence after refresh, filters, notifications and static nested routes against the deployment. Record URLs, commands/results and actual limitations. Check unauthenticated and forbidden API responses as well as the visible UI.

## Decisions needed

- Approval for M5 code/configuration preparation; accounts, downloads and publishing remain separate.
- Whether Vercel/Neon accounts already exist.
- Demo access policy: keep Admin credentials private and provide them directly to evaluators, or publish fictional demo credentials with explicit acknowledgement that anyone can modify that demo data.

## Sources checked 26 October 2026

- [Vercel Express support](https://vercel.com/docs/frameworks/backend/express): default export/listener support; Express becomes a Function; static assets must use the platform-supported output rather than relying on express.static.
- [Vercel Hobby](https://vercel.com/docs/plans/hobby): free plan, personal/non-commercial restriction and quota pauses.
- [Neon pricing](https://neon.com/pricing): Free plan explicitly states no credit card required. Current published allowance includes 1 GB storage and 100 CU-hours monthly per project; recheck at setup.
- [Vercel connection pooling](https://vercel.com/kb/guide/connection-pooling-with-functions): module-level pool reuse and attachDatabasePool lifecycle integration.
