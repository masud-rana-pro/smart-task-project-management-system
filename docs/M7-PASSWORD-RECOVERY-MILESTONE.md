# M7 - Password recovery proposal

Status: the candidate approved code/tests, selected Admin-only reset and separately approved commit/push, live publication and scoped verification on 27 October 2026. Source 64bdb0c passed CI and deployed reset/login checks; see M7-VERIFICATION.md. This supersedes the original self-service proposal below. No public recovery endpoint, reset token, email provider or new dependency was added.

## Approved implementation

Logged-in Admins open Member access, select a Team Member by name/email, enter and confirm a new 12-128 character password, acknowledge signing that member out, and submit. Members/anonymous users cannot access the directory or reset endpoint. Only TEAM_MEMBER targets are accepted; Admin accounts and unrelated account fields cannot be changed through this feature. The Admin must confirm the person's identity directly and share credentials privately. This is assisted recovery, not self-service Forgot Password.

HTTP routes validate UUID/body, enforce session/Admin/CSRF/origin and rate-limit resets to ten per Admin per fifteen minutes. The auth service hashes with existing scrypt and transactionally changes the member password and removes their sessions. Sessions also carry an HMAC tag derived from the current stored credential hash: a delayed login/session save with an old credential is rejected on the next authenticated request. The fingerprint is internal session state, never a browser identity field. Existing pre-feature sessions must sign in again after deployment. No Prisma schema, migration or runtime grants change is needed.

API and browser verification records will be maintained in M7-VERIFICATION.md. No existing live user's password is reset during preparation. A future hosted smoke test uses only an isolated fictional fixture, subject to publication approval.

## Superseded self-service research (not implemented)

## User journey

Login offers Forgot password. A user enters their registered email and receives a neutral response whether an account exists or not. A real registered mailbox receives a short-lived reset link. The link opens a password/confirmation form; success returns to login rather than automatically signing in. Users enter passwords themselves; an operator never needs to see them.

The previously suggested example address ending in .invalid is fictional and cannot receive recovery mail. Manual email-delivery testing requires an actual mailbox controlled by the candidate. Do not silently change a registered account email or send to unrelated people.

## Implementation

- Add a small recovery service, validated HTTP endpoints and frontend recovery/reset screens using existing styling, transport and security conventions.
- Cryptographically random token, database-stored digest only, proposed 15-minute expiry, single successful use and invalidation of earlier outstanding tokens. Build links from configured APP_ORIGIN, never a request Host value. Keep tokens out of logs, API responses and analytics; apply no-referrer protection and remove token-bearing browser URL state after capture.
- Transactional token consumption/password replacement, existing scrypt password rules and session invalidation. Review login/reset races so an old credential cannot create a usable session after recovery completes.
- Neutral account-existence responses, bounded request bodies, existing CSRF/origin protection and database-backed IP/account throttling. Expired/invalid/reused tokens use a safe error; email failure does not leak account existence.
- Reviewed additive PostgreSQL migration and limited runtime grants for the recovery table. No database reset, public Admin promotion or default passwords.
- Email transport behind a small interface: native HTTPS API rather than a new dependency if suitable. Tests use an injected fake delivery transport; production never displays reset links on screen as a substitute for mailbox ownership.

## Delivery provider and external gates

Brevo currently documents a Free plan with 300 daily sends and no required credit card. This is a candidate to investigate, not a promise that this specific account/sender will be activated. Sender verification and any domain/deliverability requirements must be checked for the candidate's actual setup before selecting it. Stop if paid/card verification becomes necessary; present another compliant option.

Code preparation does not approve account creation, external email delivery, new downloads, hosted migration/grants, production environment changes or publishing. Each concrete external step requires the separate approval prescribed by AGENTS.md. Do not use the candidate's shared FreeDNS parent domain as if they control it.

## Verification and outputs

Real isolated PostgreSQL tests cover token digests, expiry, reuse, replacement, concurrent consumption, session invalidation, invalid inputs and account-existence response shape. Browser tests cover recovery forms, invalid/expired links and the complete reset journey using the fake delivery transport. Run lint/types/tests/builds and existing regressions. After approved hosted setup, verify one real reset email to the candidate's own mailbox, reset/login/logout and earlier-session rejection without revealing tokens/passwords. Update API/setup documentation, requirement/evidence index and truthful AI-use records. Report preparation separately from successful live delivery.

## References checked 27 October 2026

- https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html
- https://help.brevo.com/hc/en-us/articles/208589409-About-Brevo-s-pricing-plans
- https://help.brevo.com/hc/en-us/articles/35852083084178-Domain-setup-for-better-email-deliverability
