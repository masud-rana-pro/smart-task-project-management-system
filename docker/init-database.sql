\getenv app_password APP_DB_PASSWORD
CREATE ROLE smart_task LOGIN PASSWORD :'app_password' NOSUPERUSER NOCREATEDB NOCREATEROLE;
ALTER DATABASE smart_task_demo OWNER TO smart_task;
GRANT USAGE, CREATE ON SCHEMA public TO smart_task;
