# M3 frontend milestone proposal

Status: approved by the candidate after M2 CI passes. M2 CI succeeded on commit 5d1d68e (run 40149096934). M3 is implemented and locally verified; see M3-VERIFICATION.md. Implementation CI is the remaining delivery check.

## Scope and output

Build the responsive business dashboard with accessible labels, keyboard focus and loading/error/empty states. Connect React/TypeScript screens to the verified API using the approved form, validation, query and chart libraries.

1. Registration, login, logout, session restoration and protected navigation; safe handling of expired sessions and refreshed CSRF tokens.
2. Projects and tasks screens with Admin create/edit/delete forms and clear validation. Members see the shared workspace and can update only their assigned task statuses.
3. Combined task filters, debounced title/description search, stable sorting and pagination.
4. Dashboard totals and project progress charts, including empty projects.
5. Overdue notification list, unread indicator and read action; refresh on opening and at a bounded interval while active, without offline push.
6. Responsive desktop/mobile layouts and confirmation for destructive actions.

## Verification and approval boundary

Require the full code checks, meaningful component checks and browser workflows for Admin/member permissions, CRUD, filtering and notifications against isolated PostgreSQL data. Verify mobile layouts and keyboard operation. Record real results and a learning walkthrough before signoff.

This milestone excludes live hosting/account setup, external publishing, new downloads and global tools. Existing dependency packages and GitHub commit/push authorization apply. Any additional installation needs separate approval. Final container/deployment/submission preparation follows later approvals.
