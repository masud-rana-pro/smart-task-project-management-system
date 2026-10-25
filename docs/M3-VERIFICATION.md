# M3 frontend verification

Local verification on 25 October 2026. M3 was approved after successful M2 CI on 5d1d68e. M3 CI passed on commit 564fe33: https://github.com/masud-rana-pro/smart-task-project-management-system/actions/runs/40151067852. The implemented frontend includes protected navigation, registration/login/logout, project/task forms, member status controls, combined filters/search/sort/pagination, dashboard progress charts and active in-app notifications.

## Evidence

- Final `npm run check` passed formatting, lint, TypeScript, all 28 unit/API tests and both production builds. Added browser fixture/config type checking to the root typecheck command.
- Five frontend component/date/session tests passed, including a regression for session query observers during login/logout. Twenty-three backend tests passed, including a new assertion that both roles can read only assignee IDs/names while anonymous access is rejected.
- Eight Playwright workflows passed against the isolated PostgreSQL test database using installed Chrome: four scenarios on desktop and mobile. They cover Admin project/task create/edit/delete and nonempty-project restriction; member assignment restrictions and read state; combined search/project/status/priority/assignee filters, sorting, pagination and empty/reset behavior; registration, logout and protected redirect. Registration also exercises keyboard skip-to-content navigation.
- Screenshots under ignored test-results were inspected for desktop/mobile overview, mobile task list and mobile notifications. The page does not overflow horizontally on the checked mobile notification view; the wide task table intentionally scrolls inside its container.
- The API used by browser tests is compiled and explicitly connected to TEST_DATABASE_URL. A running development API is not reused. Each fixture uses unique fictional accounts and removes its own rows afterward; no truncate/reset is used.

## Corrections and limits

Browser tests caught a real login defect: clearing the entire query cache disconnected the active session observer. Preserve that query and remove other workspace queries when changing users. The session regression test and real browser login/logout now pass.

Exact label locators did not match labels wrapping select options. Browser tests now use the accessible combobox role and name. Task search uses a debounced URL update and synchronizes the input from URL changes, retaining filter links and reset behavior.

The first frontend build reported a large bundle. Dashboard code now loads lazily so the sign-in page does not load the chart library. The final build emitted a 444.51 KB main JavaScript chunk and a separate 361.35 KB dashboard chunk (before gzip), with no chunk-size warning. GitHub CI must be checked after the implementation push.

This is local functional and visual verification, not a complete accessibility/security audit or a deployed smoke test. Container runtime, hosting, clean-checkout reproduction and final submission deliverables remain in M4-M6.
