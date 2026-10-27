# UI refinement plan

Requested 27 October 2026: audit the original assignment first, correct gaps and enhance the application one screen at a time. The PDF compliance review found the mandatory/bonus categories implemented; specific UI refinements are listed in PDF-COMPLIANCE-REVIEW.md. Preserve the approved clean business style, violet palette, existing permissions and workflow behavior.

## First approval - M8A Tasks

Status: the candidate approved M8A implementation and local verification on 27 October 2026. Commit/push and live publication remain separate approval steps.

- Add the missing Title Z-A option and verify it through the UI.
- Fix singular/plural task wording; show a clear visible range/total and improve pagination labels/disabled states.
- Refine search/filter spacing and active-filter visibility while preserving URL persistence, combined filtering and debouncing.
- Improve task rows and narrow-screen readability, making priority/status/deadline/actions easy to find without relying on color alone. Keep role-specific controls and accessible field names.
- Review loading, no-result, error/retry and dialog states. Use existing dependencies and CSS; no new downloads, migration or hosting configuration is proposed.

Verification: focused real browser assertions for descending sorting, counts/pagination and narrow layout; rerun appropriate code checks and existing desktop/mobile regressions. Capture fictional-data before/after views and review labels, focus and contrast. Present the local result before separately approved commit/push/publication.

## Subsequent screen approvals

1. Shared navigation/layout and Dashboard: spacing, hierarchy, readable totals/progress, useful responsive navigation.
2. Projects and shared forms/dialogs: cards/actions, clear validation, confirmation/focus behavior and empty states.
3. Notifications and Member access: visual read/unread hierarchy, safe reset form guidance and consistent status messages.
4. Login/registration: field states, validation, layout consistency and responsive presentation.
5. Final regression, current screenshots/report and submission evidence refresh.

Each screen group will have a concrete approval request when reached; approval of M8A does not silently approve all later implementation. External publication remains separately gated by AGENTS.md. Do not add email services, public password recovery, new role capabilities or unrelated product features under visual refinement.

## Prepared next scope - M8B Overview and navigation

Pending candidate approval: refine the shared sidebar/header and mobile navigation spacing, give page names readable labels, improve dashboard total-card hierarchy and project-progress readability, and make earliest-deadline rows wrap cleanly. Review loading, retry and empty states; keep existing dashboard definitions, API permissions and chart data intact. Use installed dependencies only. Verify both roles, dashboard values against the existing API fixtures, task/project navigation and desktop/mobile layout; save fictional-data screenshots. Local implementation/testing is a separate approval from commit/push and live publication.
