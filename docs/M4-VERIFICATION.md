# M4 verification record

Status: local verification passed on 25 October 2026; the first GitHub CI run failed its desktop pagination workflow on 26 October. A focused correction is under verification. Do not treat CI as passed until its actual run succeeds.

## Changes and findings

- Added database readiness separate from liveness, including real PostgreSQL success and simulated failure coverage.
- Added trusted HTTPS proxy/Secure-cookie regression coverage and bounded CSRF-refresh/network-response tests.
- Improved dialog entry focus and restoration, and corrected low-contrast secondary text found by a focused computed-color browser check. This check does not establish full WCAG compliance.
- Added compiled, non-root, read-only API/web containers with dropped capabilities, bounded resources and reviewed migration/seed startup.
- Prisma needed OpenSSL in the Debian build/migration image. The candidate approved container-only openssl/ca-certificates installation before the rebuild resumed.
- Nginx initially attempted to create an unused FastCGI temporary directory on its read-only filesystem. All Nginx temporary paths now use /tmp; the rebuilt web container reports healthy.
- Docker accepted the loopback port declaration on an internal-only network but left the actual published mapping empty. The candidate separately approved the web-only bridge correction; the resulting loopback HTTP/browser checks passed. No daemon changes were made.

## Actual results so far

- Dependency audit: zero known advisories reported at inspection time.
- Compose build/start: succeeded after the approved OpenSSL correction. PostgreSQL and API healthy; migration container exited 0.
- New isolated volume initialization, migration and fictional seed: passed. Two projects, four tasks and two members created. Independent before/after row digests verified seed reruns preserve all users/password hashes, projects and tasks. Removing ALLOW_DEMO_SEED was rejected with no data changes.
- Container browser smoke check: readiness, security headers, Admin login, task navigation and nested-route refresh passed with no browser exceptions.
- Runtime inspection: API uid 1000 and Nginx uid 101; read-only root filesystems, ALL capabilities dropped and no-new-privileges verified. Application PostgreSQL role has no superuser, create-database or create-role privileges. One migration finished successfully.
- Initial concurrent full check: formatting, lint and type checks passed; frontend 8 tests passed; backend 26 passed and 1 timed out at its five-second limit.
- Initial concurrent browser run: 4 passed, 4 failed at the five-second login-heading assertion while Docker builds and API password tests were also running. No functional verdict is inferred from these timeouts. Sequential reruns remain required.
- Sequential npm run check: passed, including 8 frontend and 27 backend tests with no skips, lint, formatting, type checks and both builds.
- Next browser run: 7 passed; the first dashboard lazy-load still exceeded the five-second heading assertion. Changed only the post-login heading allowance to 15 seconds for cold development startup; final full rerun pending.
- Final full browser rerun: 8 passed in 2.6 minutes using installed Chrome, exit code 0. Admin/member CRUD/permission workflows, search/filter/pagination, notifications, registration, skip navigation, dialog entry/restored focus and focused text-contrast checks passed. Desktop/mobile overview screenshots were visually reviewed after the color corrections.
- First CI run for 957046a: schema/migration/full code checks passed; seven browser cases passed, desktop pagination failed after all retries. The test could click Next while search was still debouncing because unfiltered data also had two pages. It now waits for the intended search and sorting URL before pagination. The search callback also reads current URL filters and ignores unchanged values so a delayed callback cannot restore an older filter snapshot or reset a page for a no-op search.
- Correction verification: both desktop/mobile pagination workflows passed locally; all 35 unit/API tests passed again. Full code-check completion and the next CI result are recorded after execution.

## Images observed

- node:24-bookworm-slim: sha256:55fb5f5a527ea2c5c4a95f963e48ef90aa38c7b346054fdc8ee9957a2b55d205
- nginx:stable-alpine: sha256:47928bf67eb62a1863cb08d9ecb52d3e704304ba614eaee17884204677702951
- postgres:17-alpine: sha256:eee6c6e1b0894fa4fe0075eb054af9fd1cf39a35321c2d4110626cfe506411fb

Tags can move. These are observed build/pull digests, not a promise that a future pull resolves identically.

## Remaining

Final formatting/secret scan, approved commit/push and successful GitHub CI. Live deployment, candidate learning demonstration and complete manual accessibility assessment remain outside this milestone.
