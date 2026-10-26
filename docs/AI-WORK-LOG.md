# AI assistance work log

## Admin-assisted recovery enhancement, 27 October 2026

During candidate-reported manual testing, Member login did not accept the supplied credentials. The candidate asked for Forgot Password, approved implementation preparation and then declined email verification/recovery codes. After discussing the account-takeover risk of unverified anonymous reset, the candidate explicitly selected Admin-only Member reset. Codex implemented the role-protected HTTP/service/UI flow, transactional password/session update, internal credential fingerprint guard against delayed old-credential sessions and new real-PostgreSQL/browser regressions. No new dependency or schema change was needed. Hosted publication remains a separate approval gate; candidate-supplied existing credentials are not displayed or changed as part of preparation.

After separate publication approval, source 64bdb0c passed CI and deployed on the existing origin. Codex verified the complete Admin-screen reset -> hosted credential/session state -> old session/password rejection -> replacement Member login -> logout flow using only a new fictional Member. Scoped cleanup preserved existing candidate data and accounts. Results are recorded in M7-VERIFICATION.md; candidate manual testing of their own Member account remains separate.

This is a factual working log, not the final one-page report. The final report must describe completed work and verification. Do not invent candidate implementation work or incorrect suggestions to meet the assignment format.

## Tool and contributions

OpenAI Codex read the assignment, extracted requirements, conducted multiple-choice planning interviews, drafted architecture/acceptance documents and integrated the M1 scaffolding, schema and initial tests. Vite/npm/TypeScript/Prisma CLIs generate the standard skeleton where applicable. The candidate selected PostgreSQL, TypeScript approval, permissions, notification behavior, date semantics, public repository naming, and approval gates. These decisions are candidate contributions; do not claim the candidate manually wrote AI-generated files.

## Actual prompt excerpts for the final report

1. "Before doing development i want to plan appropriately as industrial way" - requested planning, prerequisites, GitHub/free hosting and confirmation gates.
2. "ask me these quiations as interview in multiple choice questions" - established the decision interview workflow.
3. "reduse the project skeliton creation by command" - requested official scaffolding commands rather than manually creating every starter file.

Preserve these as excerpts and replace/add implementation prompts later if more useful for the final report.

## Actual issues and corrections

- Initial npm command combined a text package name with `--json`, causing a JSON parse error. Split text and boolean configuration into separate npm commands and verified generated manifests. No claim that a failed command succeeded.
- npm's default Prisma tag resolved to an 8.0 release candidate. Selected the stable 7.x major and matching client/adapter instead. Verify the final installed versions from the lockfile.
- Patch integration attempted delete/add operations on the same file; the patch tool rejected that format. Switched to a batch project-configuration script for the generator outputs. File access under the sandbox also required authorized execution outside it.
- PostgreSQL startup attempts were denied by Windows. Kept API liveness separate from database readiness so the application cannot falsely claim database success.

## Verification

Initial results: formatting, ESLint, TypeScript checks, both production builds, two frontend tests and five backend tests passed. One real-database test skipped because no TEST_DATABASE_URL was configured. Prisma 7.10.1 validated the schema and generated the client. SQL was generated with migrate diff and reviewed for constraints; it has not yet been applied locally. A full clean npm ci passed; the final check pipeline passed again. Two Playwright browser tests passed using installed Chrome on desktop/mobile profiles, and screenshots were visually reviewed. The dedicated Chromium download failed with network resets/DNS errors, so it was not used. AI-generated code remains subject to review and tests. Candidate learning checkpoints: explain app versus server separation, Vite's /api proxy, npm workspaces, schema/migrations, and why liveness is not database readiness.

The latest form resolver (6.x) produced a real optional-peer conflict between Effect versions. Corrected by selecting compatible @hookform/resolvers 5.9.2; installed dependency tree is valid without --force or --legacy-peer-deps. npm audit reported zero known vulnerabilities at installation time; this does not prove the application is secure.

Prisma init attempted an additional automatic skills step. Stopped that step, retained only the project database starter, explicitly selected prisma.config.ts in commands, and excluded empty tool-specific agent directories. No global agent settings were changed.

On 25 October 2026, verified local connection URL target restrictions and authentication without displaying credentials. Applied the initial migration to both empty approved databases and reran all frontend/backend tests: eight passed, zero skipped. The candidate supplied the GitHub repository and authorized appropriate commits/pushes. No credentials were added to version control.

## M2 implementation, 25 October 2026

The candidate approved M2 after foundation CI passed and then requested continuation. Codex implemented the authentication, sessions, validation, role-protected APIs, dashboard calculations, notifications, guarded seed/Admin CLI, API documentation and PostgreSQL tests. The candidate provisioned the isolated database role/databases locally and selected the business rules; no claim is made that the candidate manually wrote this generated implementation.

Reviewed password hashing against the OWASP Password Storage Cheat Sheet and session behavior against express-session documentation. Used Node scrypt with per-password salts, database-backed sessions and shared atomic login counters. Runtime/session pools share a bounded PostgreSQL pool.

Actual correction: applying defaults to a partially optional Zod task schema could reset omitted PATCH fields. Split create defaults from update fields and added a regression test. Fixed TypeScript strict optional-field handling and Express request augmentation after lint/type checks reported problems. Playwright's Windows development watcher startup stalled; changed E2E startup to the compiled API and verified both fresh-start browser profiles successfully.

Actual results: full formatting/lint/type/test/build pipeline passed with 24 unit/API tests (22 backend and 2 frontend), zero skips; two foundation browser tests passed using installed Chrome. An authenticated compiled-server dashboard check matched direct database counts. Guarded seed reruns preserved records/password hashes, and missing opt-in was rejected without changes. See M2-VERIFICATION.md. Feature frontend and deployment validation remain future work.

## M3 implementation, 25 October 2026

The candidate approved M3 conditional on M2 CI success; run 40149096934 succeeded. Codex implemented the React interface, forms, query/session integration, dashboard chart, filters and notification views with existing approved dependencies. Both roles can read minimal assignee IDs/names for the approved filter; a PostgreSQL API test verifies no email/password fields are exposed.

Browser tests exposed an incorrect AI implementation: clearing the full query cache on login removed the active session observer, leaving the login screen visible after API success. Preserved the session query while removing other workspace caches, then verified the member workflow and added a component regression for login/logout notifications. Select labels containing option text also caused an exact test locator mismatch; switched tests to accessible combobox roles. The initial build flagged a large bundle; split dashboard/chart loading from sign-in.

Actual results so far: 5 frontend tests and 23 backend tests passed; all 8 real PostgreSQL desktop/mobile browser workflows passed. Visually inspected desktop/mobile screenshots. Browser fixtures use unique fictional rows, scoped cleanup and TEST_DATABASE_URL; development data is not used by the suite. No new dependencies or external publishing beyond the approved GitHub work were needed. The candidate has not yet been recorded as demonstrating these workflows; see LEARNING-CHECKPOINTS.md.

## M4 implementation, 25 October 2026

After the candidate approved M4 and M3 CI succeeded, Codex reviewed security, error handling, focus and text contrast; implemented readiness checks and targeted regressions; and wrote Dockerfiles, Compose, initialization and credential-preparation scripts. The candidate separately approved Docker startup, base-image/dependency downloads, isolated containers, container-only OpenSSL/CA packages and the web-only network correction. No global Codex, Windows/WSL or unrelated database settings were changed.

Actual corrections: Prisma needed OpenSSL in its Debian build/migration image; Nginx tried to create default temporary directories on a read-only filesystem; and Docker left the host port unpublished for an internal-only network. Corrected these with approved image packages, /tmp paths and a web-only bridge while retaining private database/API networking. The initial parallel verification overloaded the local machine and produced five-second test timeouts. Sequential code checks passed all 35 unit/API tests. A cold dashboard lazy-load still exceeded a five-second browser assertion, so only that post-login assertion now allows 15 seconds.

Container verification passed readiness, security headers, authenticated task navigation and nested-route refresh with no browser exceptions. Independent row digests confirmed seed reruns preserve users/password hashes, projects and tasks; missing opt-in refused without changes. Verified non-root API/Nginx, read-only filesystems, dropped capabilities and a non-administrative application database role. Final browser/CI status is tracked in M4-VERIFICATION.md. Candidate explanation/demonstration remains pending; code generation is attributed to Codex rather than claimed as candidate-authored work.

On 26 October, CI exposed a pagination test race: the test could see two unfiltered pages and click Next before the pending search updated the URL, then search legitimately reset the page. Added an explicit URL expectation before pagination and corrected the delayed filter callback to merge the latest URL parameters and ignore unchanged values. The first CI run is recorded as failed rather than replaced with local passing evidence. The candidate approved M5 preparation conditional on M4 CI success, has neither hosting account yet and selected private evaluator Admin credentials.

## M5 preparation, 26 October 2026

M4 CI passed on 2754bc8. Within the approved preparation scope, Codex extracted shared Express runtime composition, drafted a root Vercel function adapter and same-origin routing/security configuration, and added production runtime tests and operator documentation. No hosting accounts or public deployment were created.

The separately approved Vercel CLI download introduced 35 reported dependency vulnerabilities, including a critical tar issue; removed that optional CLI instead of keeping it in the project. The provider helper's pinned Zod dependency also had an advisory. A scoped override to the existing Zod 4.6.7 worked when the provider dependency was placed in the root adapter's owning package; the workspace-local attempt did not apply the override. The final install and production audit reported zero known vulnerabilities. No force fix or global installation was used.

The code check passed 37 unit/API tests and both builds. The compiled function smoke helper verified readiness, unauthorized API protection and Secure cookies; its initial forced exit triggered a Windows libuv assertion, so added explicit internal resource cleanup and verified clean exit 0. Platform routing, hosted TLS connectivity, account setup and deployed smoke tests remain unverified until their separate approvals and execution.

The candidate created the free provider accounts and Neon project privately, confirmed the production branch/database/owner, authorized role/migration setup with "proceed", and pasted the owner URI only into an ignored local file. Codex wrote the guarded operator helper and SQL grants. A too-strict hostname guard initially rejected Neon's c-2 segment; corrected it and the pooled-host label transformation before connecting/mutating. Direct TLS inspection, SQL role creation, committed migrations, scoped grants and pooled runtime privilege checks all passed. No hosted application account/bootstrap or public deployment occurred in this step.

With separate candidate approval, Codex bootstrapped the fictional private evaluator Admin using the existing compiled CLI and a random locally stored password. Verified ADMIN role and the password using the application's scrypt verifier, without displaying credentials/hashes or sending email. The candidate approved only the named repository's Vercel connection and Import configuration, with deployment still gated.

The candidate then uploaded the production environment and initiated the first deployment after asking for and receiving a go-ahead. Their pasted build log showed a gap in the AI-authored deployment configuration: npm ci under NODE_ENV=production omitted build-time dev dependencies, causing missing Vite/Vitest modules and TypeScript declarations. Corrected the Vercel install command to npm ci --include=dev and changed CI installation to exercise production NODE_ENV explicitly. This is a build-environment correction rather than weakening TypeScript checks or moving all tooling into runtime dependencies.

The candidate requested direct Vercel assistance, installed its connector and approved team access after native browser capture failed. Codex corrected only Production APP_ORIGIN and redeployed via that connection, then verified live login/session/logout. The expanded browser test exposed another deployment-only issue: Vercel forwards unused rewrite path parameters into the query, which strict task-query validation correctly rejected. Added a deployment-only normalizer and two regressions that preserve valid filters and retain unknown application fields for rejection. Scoped live-test cleanup preserved the evaluator Admin. Final live workflow evidence remains pending this fix's deployment.

## Final audit and M6, 26 October 2026

The candidate conditionally approved final documents after checking SoC and requirements and fixing gaps. Codex inspected the assignment again, audited the implementation and extracted application operations into backend services. Frontend already separates screens, shared UI/forms, transport, session/cache and types, with query orchestration in pages. This is pragmatic layering with direct Prisma persistence, not strict Clean Architecture or an extra generic repository abstraction. After refactoring, 39 code tests, static checks, builds and eight local browser workflows passed; the full deployed workflow also passed against source f7d0cb3. A later architecture-document edit was not formatted before committing, causing CI's formatting gate to fail; formatted the document and retained the failed-run record.

Codex prepared the final README, requirement/evidence audit, project description, submission index, candidate walkthrough and one-page AI report/editable source. The report PDF was generated with bundled reportlab, reopened with pypdf and rendered for visual inspection. Candidate rehearsal is not claimed. The candidate controls only masud.root.sx, so parent TXT ownership verification prevents completing that optional custom address; no DNS record was changed. No employer message was sent.
