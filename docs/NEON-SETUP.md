# Approved hosted database setup

On 26 October 2026 the candidate confirmed project bright-mind-smart-task, branch production (Default), database bright_mind_db, owner bright_mind_db_owner, PostgreSQL 17 and AWS Singapore. After the owner/application-role proposal, the candidate instructed "proceed"; this authorizes role and migration setup on this dedicated target. GitHub connection, hosted application Admin bootstrap and public deployment still have separate gates.

## Local credentials

In Neon Connect, choose production, bright_mind_db and bright_mind_db_owner. Turn connection pooling OFF and copy only the PostgreSQL URI privately into ignored .local/neon.env as NEON_DIRECT_URL. Do not replace backend/.env, send credentials in chat, or paste the URI into terminal history. The helper enforces the expected database, owner, direct Singapore Neon hostname and TLS certificate verification. The production branch must be selected when copying the URI; a PostgreSQL database query alone cannot prove the console branch name.

## Ordered operator commands

From the repository root:

```sh
node scripts/neon-database.mjs inspect
node scripts/neon-database.mjs role
node scripts/neon-database.mjs migrate
node scripts/neon-database.mjs grant
node scripts/neon-database.mjs verify
```

Run and review each result before the next command. Inspect is read-only. Role refuses to alter an existing smart_task_app or overwrite .local/neon-app.env. It creates a SQL role without administrative flags/memberships, generates a random password and saves its pooled URL only to the ignored local file. If creation fails after the private file was written, review the partial state before retrying; do not delete resources or reset passwords automatically.

Migrate accepts only empty public schema or known application tables with this repository's migration history. It applies the committed migrations through the owner direct connection, without reset/seed. Grant runs the reviewed grant-neon-runtime.sql transaction: it removes public-schema CREATE from PUBLIC within this dedicated database and grants runtime SELECT/INSERT/UPDATE/DELETE only on users, projects, tasks, sessions, notifications and auth_rate_limits. It does not grant the migration table, TRUNCATE or blanket rights on future tables.

Verify uses the application pooled URL for the same endpoint/database, checks TLS authentication and administrative flags, refuses public-schema CREATE/migration-table SELECT, and verifies every required DML privilege on each application table. It writes no application rows. These checks are not proof of public application deployment.

Use the runtime URL for Vercel only after the publishing/environment gate. Keep the owner connection local to migration operations. Do not upload .local files to Git or share their contents in chat.

## Evidence

Hosted inspect, SQL role creation, committed migration deployment, grants and pooled TLS privilege verification passed on 26 October. Inspect confirmed an initially empty public schema. The candidate supplied the owner URI only through the ignored local file. Initial hostname validation rejected Neon's additional c-2 segment before connecting; the helper was corrected to accept that format and append -pooler to the endpoint's first DNS label. The migrated schema has the six application tables and Prisma history. No application seed or Admin bootstrap has run yet. See M5-VERIFICATION.md.

References: [Neon roles](https://neon.com/docs/manage/roles), [connection pooling](https://neon.com/docs/connect/connection-pooling).
