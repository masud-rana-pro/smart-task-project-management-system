-- Run only on the reviewed dedicated database, after the committed migrations.
BEGIN;
DO $$
BEGIN
  IF current_database() <> 'bright_mind_db' OR current_user <> 'bright_mind_db_owner' THEN
    RAISE EXCEPTION 'Unexpected database or owner';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'smart_task_app') THEN
    RAISE EXCEPTION 'Create and review smart_task_app first';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_roles WHERE rolname = 'smart_task_app'
      AND (rolsuper OR rolcreatedb OR rolcreaterole OR rolreplication OR rolbypassrls)
  ) OR pg_has_role('smart_task_app', 'bright_mind_db_owner', 'MEMBER') THEN
    RAISE EXCEPTION 'Application role has unexpected administrative privileges';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'neon_superuser') THEN
    IF pg_has_role('smart_task_app', 'neon_superuser', 'MEMBER') THEN
      RAISE EXCEPTION 'Application role must not inherit neon_superuser';
    END IF;
  END IF;
END $$;
-- This dedicated database belongs only to this application. Its owner retains DDL access.
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM smart_task_app;
GRANT CONNECT ON DATABASE bright_mind_db TO smart_task_app;
GRANT USAGE ON SCHEMA public TO smart_task_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.users, public.projects, public.tasks, public.sessions,
  public.notifications, public.auth_rate_limits TO smart_task_app;
-- Do not grant access to Prisma's migration table or blanket rights on future tables.
COMMIT;
