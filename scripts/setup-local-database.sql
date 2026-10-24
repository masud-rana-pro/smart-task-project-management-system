-- Run interactively with psql as a local PostgreSQL administrator.
-- No passwords belong in this file or in command-line arguments.
\set ON_ERROR_STOP on

-- Refuse to alter any existing role or database with these names.
SELECT (
  EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'smart_task') OR
  EXISTS (SELECT 1 FROM pg_database WHERE datname IN ('smart_task_dev', 'smart_task_test'))
) AS target_exists \gset

\if :target_exists
  \echo 'Stopped: a target role/database already exists. No changes made. Review it before proceeding.'
  \quit 1
\endif

CREATE ROLE smart_task LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION;
-- psql prompts securely, confirms the password, and avoids plaintext history.
\password smart_task
CREATE DATABASE smart_task_dev OWNER smart_task;
CREATE DATABASE smart_task_test OWNER smart_task;
\echo 'Created only smart_task, smart_task_dev and smart_task_test.'
