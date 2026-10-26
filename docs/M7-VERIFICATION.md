# Admin-assisted member password reset

Date: 27 October 2026. The candidate selected an authenticated Admin-only reset after deciding against email delivery and recovery codes. This extends the completed assignment without exposing an anonymous reset endpoint.

## Implementation

- Admin-only Member access screen: member name/email selector, password and confirmation fields, explicit sign-out acknowledgment and safe success/error states. Password inputs clear after success.
- GET /api/auth/members exposes member identities only to Admins. POST /api/auth/members/{id}/reset-password accepts only a valid password and TEAM_MEMBER target, with authentication, Admin authorization, CSRF/origin validation and ten attempts per Admin per fifteen minutes.
- The auth service checks the target, hashes through existing scrypt and transactionally replaces the credential/removes target sessions. It preserves identity, role, projects and tasks. Internal HMAC credential fingerprints reject pre-reset sessions even if a delayed request saves them after the reset.
- No dependency, schema, migration, hosted grant or email provider change. On rollout, pre-feature sessions need to sign in again.

## Verification status

npm run check passed formatting, lint with zero warnings, strict TypeScript checks, 8 frontend tests, 33 backend tests, both deployment-routing tests and both builds (43 tests total). Real PostgreSQL tests ran with the isolated test database. New API tests exercised permission boundaries, safe directory fields, strict body validation, Admin/nonexistent target rejection, password hashing, session deletion, stale-session resurrection rejection and throttling. The new browser story uses separate Admin/member contexts, confirmation mismatch, reset, member logout and old/new password checks; final desktop/mobile regression status is recorded below after completion.

An initial React lint warning prompted switching React Hook Form watch to useWatch; strict TypeScript checks prompted a fixed-length fixture tuple. These development corrections did not affect live data. React review checked hooks, role-gated queries, semantic labels, error associations, pending states and mobile navigation width.

npm run test:e2e with PLAYWRIGHT_CHANNEL=chrome passed all ten desktop/mobile stories in 2.6 minutes, exit 0. This includes both new reset stories and all eight existing workflow regressions. The reset screen passed the selected solid-background contrast checks and a viewport-width assertion on both device profiles. These focused checks are not a full accessibility certification. Final formatting/diff checks passed.

## Approved publication and live verification

The candidate separately approved commit/push, Git-connected deployment and a scoped fictional-member smoke test. Implementation commit 64bdb0c passed [GitHub CI run 40380306234](https://github.com/masud-rana-pro/smart-task-project-management-system/actions/runs/40380306234). Vercel deployment dpl_BngBhaiFksazxo4LYCNHdDTTtmXt became READY for that exact commit on the existing HTTPS production alias.

node tmp/verify-live-member-reset.mjs exited 0. Its desktop Admin/mobile Member browser flow passed reset through the Admin screen, member endpoint attacks rejected with 403, hosted password-hash verification, previous-session rejection, old-password rejection, replacement-password login, unchanged Admin identity and both logouts. Zero browser JavaScript exceptions were observed. The selected member's stored role remained TEAM_MEMBER and the password inputs cleared after success.

Cleanup removed only the run's UUID-tagged fictional Member and captured verification sessions. Existing candidate accounts, projects and tasks were preserved. The candidate's real Member password was not reset by this smoke test; they can now use Member access to perform that action themselves. No schema migration, hosted grant, dependency installation or provider setting change was needed.
