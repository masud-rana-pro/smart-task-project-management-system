# Projects and forms polish

27 October 2026. Local M8C work was approved after documentation CI 40470012590 passed. Publication is a separate approval.

## Changes

Project cards now show singular task counts correctly, readable completion totals and named progress bars. Descriptions retain their full text and line breaks. Cards align their completion/actions area, wrap long names and use larger action targets. A failed progress request has a distinct unavailable message and Retry progress action instead of an apparent zero result.

Project and task dialogs explain required fields, keep field names stable when errors appear, and connect validation messages to their inputs. Task description errors are displayed as well. Mobile actions share the available width, while the dialog title and Close button stay visible during scrolling. Existing focus restoration, Escape handling, API validation and role permissions remain in place.

No dependencies, database changes or hosted data edits were needed.

## Verification

`npm run check` exited 0: formatting, lint, TypeScript, 43 code tests (8 frontend, 33 backend, 2 routing) and both production builds passed. The API tests used the isolated PostgreSQL test database. The final extended browser-test source was also type-checked separately.

`PLAYWRIGHT_CHANNEL=chrome npm run test:e2e` exited 0 with all 10 desktop/mobile workflows passing in 2.4 minutes. The expanded Admin story checks blank-form errors through accessible descriptions, first-invalid-field focus, zero/singular task wording, progress semantics, a controlled progress API failure followed by real recovery, and project/task creation, editing and deletion. Existing permission, session/reset, filter/sort/pagination, notification and registration stories also passed.

Screenshot review prompted a final refinement to keep the dialog heading and Close button visible when scrolling a long form. `PLAYWRIGHT_CHANNEL=chrome npm run test:e2e -- --grep "Admin manages a project"` then passed both profiles in 50.8 seconds, exit 0, including assertions that the heading and Close button remain in the viewport. The runner printed an npm server-process shutdown message after the last passing test; it did not fail either workflow or the suite.

The React review checked stable IDs, unconditional hooks, derived data, accessible names and error associations without introducing new state or dependencies. Screenshot and focused contrast checks are practical verification, not a full accessibility certification.

Six fictional-data screenshots are saved in output/evidence/m8c/: projects-desktop.png, projects-mobile.png, project-form-desktop.png, project-form-mobile.png, task-form-desktop.png and task-form-mobile.png. Desktop/mobile card and form views were visually reviewed; the final task-form captures confirm the visible sticky heading and usable lower actions. No before screenshots are claimed.

## Release status

Local work only. M8C has not been committed, pushed or deployed. The previously verified M8B release remains live. Submission report architecture, feature descriptions and test counts remain applicable.
