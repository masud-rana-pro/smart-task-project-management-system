# Tasks screen refinement

Date: 27 October 2026. The candidate approved this first UI milestone after the original assignment audit. Publication requires a separate approval.

## Changes

The Tasks screen now includes Title Z–A, singular/plural task counts, visible result ranges and removable active-filter chips. Search, filters and sorting continue to use URL parameters so a refreshed page retains its selection. An empty later page offers a way back to the first page, including when another request deletes its last task.

Desktop keeps the task table. On narrow screens the same rows become labelled cards, with project, assignee, deadline, priority, status and actions visible without horizontal scrolling. There is one set of controls, preserving the existing Admin and Member permissions.

The scope uses existing dependencies and does not change database schemas, credentials, hosted data or provider configuration.

## Verification record

The first code check reached an existing password-reset integration test's five-second timeout while performing multiple scrypt operations. Only that test's time allowance was increased to 30 seconds; its security assertions were preserved. The subsequent full check passed all 43 tests, formatting, lint, TypeScript checks and both builds.

The initial browser run passed nine stories and exposed a rapid search/filter timing issue on desktop. Its request trace showed the search parameter present in one API request and missing in the following sort request. The query-parameter ref now synchronizes in a layout effect, before another input event can merge an older selection. The same rapid interactions remain in the test.

After that correction, `PLAYWRIGHT_CHANNEL=chrome npm run test:e2e` passed all ten desktop/mobile stories in 3.6 minutes, exit 0. These exercise real PostgreSQL persistence, authentication, member password reset/session revocation, permissions, project/task CRUD, combined filters, both title sort directions, refresh persistence, empty-page recovery, individual filter removal, singular counts and pagination ranges. Selected text-contrast and viewport/table-width checks also passed. The Windows web-server teardown printed an npm lifecycle message after the stories; Playwright completed successfully with exit 0.

## Evidence and release

Final `npm run check` after the search/sort correction passed again: formatting, lint, strict type checks, 8 frontend tests, 33 backend tests, 2 deployment-routing tests and both production builds; exit 0. `git diff --check` also passed.

Before views are preserved in output/evidence/m8a/tasks-before-desktop.png and tasks-before-mobile.png. After views are tasks-after-desktop.png and tasks-after-mobile.png in the same directory. Both after images were visually inspected: filters and counts are legible, desktop retains aligned columns, and mobile exposes the complete task in a card. These are fictional isolated-test data, not candidate credentials or production records. This does not claim hands-on mobile testing by the candidate or a complete accessibility certification.

Current status: local browser verification complete; no M8A commit, push or deployment has been made. The submission AI report will be refreshed in the final UI/document milestone; its existing counts describe the earlier dated release.
