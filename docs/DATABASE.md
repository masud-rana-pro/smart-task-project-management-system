# Database setup and seed design

M1 provides schema and migration files. PostgreSQL was subsequently observed running and accepting connections. The candidate approved creating only the dedicated smart_task login and smart_task_dev/smart_task_test databases. Administrative credentials were entered locally. On 25 October 2026, all three application connection settings authenticated successfully, the initial migration applied to both approved databases, and the database integration test passed.

## Approved local setup steps

Open PowerShell in the repository folder and run:

```powershell
psql -h 127.0.0.1 -U postgres -d postgres -f scripts/setup-local-database.sql
```

Use your existing local administrator username if it is not `postgres`. Enter that administrator's password only at the local psql prompt. The script then asks twice for a new strong password for `smart_task`. It refuses to proceed if any target already exists. It does not change the administrator password, PostgreSQL configuration or existing database contents. If it stops partway through, do not delete/reset anything; inspect the error and ask for a targeted repair.

Using a local text editor, configure backend/.env from backend/.env.example with the new smart_task credentials and these database names. Set DATABASE_URL and DIRECT_URL to smart_task_dev; set TEST_DATABASE_URL to smart_task_test. Percent-encode special characters in the URL password. Do not share passwords or .env contents in chat. Authentication/session secrets will be generated before M2, not hardcoded here.

Once configuration is complete, run the approved migration/check commands or let the agent execute them without printing the URLs. backend scripts load backend/.env. Database tests must load that file as well; otherwise a configured TEST_DATABASE_URL in the file would not reach the test process.

## Local provisioning decisions

After explicit approval of the isolated targets, create a dedicated non-superuser project login and databases `smart_task_dev` and `smart_task_test`, owned by that login. Use PostgreSQL 17 initially. Have the candidate enter credentials locally through an administrative database tool. Never reuse unrelated application databases, commit credentials or modify global server authentication settings.

Run migrations with a direct connection to the target. For hosted PostgreSQL, use an appropriate bounded pooled connection for runtime access. Prisma and connect-pg-simple share one bounded pool per API instance in M2. Hosting connection limits still need verification.

## Initial schema intent

Users have unique normalized email and an Admin/Team Member role. Projects reference their creator; tasks reference a project, assignee and creator. Project deletion is restricted by the database when tasks exist. Deadlines use PostgreSQL DATE and are interpreted through the end of that date in Asia/Dhaka. Notification uniqueness prevents duplicates for the same recipient/task/deadline/type. Sessions follow the connect-pg-simple-compatible table shape. A shared auth rate-limit table is reserved for M2's serverless-safe login throttling.

Migration SQL is generated from the schema using `prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script`, then reviewed and committed. Generation/validation alone does not prove it runs on PostgreSQL. CI creates an isolated PostgreSQL service and tests table creation and deletion restrictions; local execution requires access and target approval.

## Implemented M2 seed/admin setup

M2 implements and locally verifies the seed together with the login password hashing. It:

1. Require an explicit opt-in and an isolated development/demo target.
2. Use fictional example.invalid accounts, one Admin and at least two members.
3. Read required passwords from local environment or secure input, without hardcoded production defaults or password logging.
4. Hash passwords with the same reviewed scrypt implementation as login.
5. Upsert stable sample projects and tasks covering statuses, priorities, due today, future deadlines and overdue deadlines.
6. Refuse destructive reseeding and document how to rerun safely.

Use `npm run admin:create` with locally supplied ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD to provision an Admin. Use `npm run db:seed` with those fields, DEMO_MEMBER_PASSWORD and explicit ALLOW_DEMO_SEED=true for the approved local demo database. Placeholder passwords are rejected; existing account passwords are preserved. The seed allows only local smart_task_dev/smart_task_test targets, or the exact container host/database db/smart_task_demo with an additional ALLOW_CONTAINER_DEMO_SEED=true opt-in, and refuses production. See README.md for PowerShell steps and CONTAINERS.md for the isolated container workflow. There is no public Admin-creation endpoint. Public demo access policy needs separate deployment approval.
