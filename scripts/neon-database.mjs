import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { parse } from 'dotenv';
import pg from 'pg';

const root = fileURLToPath(new URL('../', import.meta.url));
const mode = process.argv[2] ?? 'inspect';
const allowedModes = ['inspect', 'role', 'migrate', 'grant', 'verify'];
const tableNames = [
  'users',
  'projects',
  'tasks',
  'sessions',
  'notifications',
  'auth_rate_limits',
];
let pool;
try {
  if (!allowedModes.includes(mode)) throw new Error('Unknown mode');
  const settings = parse(readFileSync(resolve(root, '.local/neon.env')));
  const direct = new URL(settings.NEON_DIRECT_URL);
  if (
    !['postgres:', 'postgresql:'].includes(direct.protocol) ||
    !/^ep-[a-z0-9-]+\.(?:c-\d+\.)?ap-southeast-1\.aws\.neon\.tech$/.test(
      direct.hostname,
    ) ||
    direct.hostname.includes('-pooler.') ||
    decodeURIComponent(direct.pathname) !== '/bright_mind_db' ||
    decodeURIComponent(direct.username) !== 'bright_mind_db_owner' ||
    !direct.password
  )
    throw new Error('Unexpected owner connection target');
  direct.searchParams.set('sslmode', 'verify-full');
  pool = new pg.Pool({
    connectionString: direct.href,
    max: 1,
    connectionTimeoutMillis: 15000,
  });
  const {
    rows: [identity],
  } = await pool.query(
    'SELECT current_database() AS database, current_user AS owner',
  );
  if (
    identity.database !== 'bright_mind_db' ||
    identity.owner !== 'bright_mind_db_owner'
  )
    throw new Error('Connected identity mismatch');
  const { rows: tables } = await pool.query(
    "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename",
  );
  console.log(
    JSON.stringify({
      host: direct.hostname,
      ...identity,
      publicTables: tables.map((row) => row.tablename),
    }),
  );
  if (mode === 'role') {
    const appFile = resolve(root, '.local/neon-app.env');
    const {
      rows: [existing],
    } = await pool.query(
      "SELECT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='smart_task_app') AS present",
    );
    if (existing.present || existsSync(appFile))
      throw new Error('Existing role or credential file requires review');
    const password = randomBytes(32).toString('hex');
    const app = new URL(direct);
    app.hostname = direct.hostname.replace(/^([^.]+)/, '$1-pooler');
    app.username = 'smart_task_app';
    app.password = password;
    await pool.query('BEGIN');
    try {
      // The interpolated value is generated hex only, never external SQL input.
      await pool.query(
        `CREATE ROLE smart_task_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS PASSWORD '${password}'`,
      );
      writeFileSync(appFile, `NEON_DATABASE_URL=${app.href}\n`, {
        flag: 'wx',
        mode: 0o600,
      });
      await pool.query('COMMIT');
      console.log(
        'Created smart_task_app with a random password saved only in ignored .local/neon-app.env. No object permissions granted yet.',
      );
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  }
  if (mode === 'migrate') {
    const known = new Set([...tableNames, '_prisma_migrations']);
    if (
      tables.some((row) => !known.has(row.tablename)) ||
      (tables.length &&
        !tables.some((row) => row.tablename === '_prisma_migrations'))
    )
      throw new Error('Unexpected existing schema; migration refused');
    const migrations = readdirSync(
      resolve(root, 'backend/prisma/migrations'),
    ).filter((name) => name !== 'migration_lock.toml');
    if (tables.length) {
      const { rows } = await pool.query(
        'SELECT migration_name FROM public._prisma_migrations',
      );
      if (rows.some((row) => !migrations.includes(row.migration_name)))
        throw new Error('Unknown migration history');
    }
    const result = spawnSync(
      process.execPath,
      [
        resolve(root, 'node_modules/prisma/build/index.js'),
        'migrate',
        'deploy',
        '--config',
        'prisma.config.ts',
      ],
      {
        cwd: resolve(root, 'backend'),
        encoding: 'utf8',
        env: {
          ...process.env,
          DATABASE_URL: direct.href,
          DIRECT_URL: direct.href,
        },
      },
    );
    if (result.error || result.status !== 0)
      throw new Error(
        'Prisma migration failed; raw output withheld to protect credentials',
      );
    console.log(
      'Committed migrations applied successfully; no reset or seed was run.',
    );
  }
  if (mode === 'grant') {
    await pool.query(
      readFileSync(resolve(root, 'scripts/grant-neon-runtime.sql'), 'utf8'),
    );
    console.log(
      'Runtime DML permissions granted on the six application tables only.',
    );
  }
  if (mode === 'verify') {
    const appSettings = parse(
      readFileSync(resolve(root, '.local/neon-app.env')),
    );
    const app = new URL(appSettings.NEON_DATABASE_URL);
    const expectedHost = direct.hostname.replace(/^([^.]+)/, '$1-pooler');
    if (
      !['postgres:', 'postgresql:'].includes(app.protocol) ||
      app.hostname !== expectedHost ||
      app.pathname !== '/bright_mind_db' ||
      decodeURIComponent(app.username) !== 'smart_task_app' ||
      !app.password
    )
      throw new Error('Unexpected pooled application connection');
    app.searchParams.set('sslmode', 'verify-full');
    const runtimePool = new pg.Pool({
      connectionString: app.href,
      max: 1,
      connectionTimeoutMillis: 15000,
    });
    try {
      const {
        rows: [role],
      } = await runtimePool.query(
        'SELECT current_user AS role, rolsuper, rolcreatedb, rolcreaterole, rolreplication, rolbypassrls FROM pg_roles WHERE rolname=current_user',
      );
      if (
        role.role !== 'smart_task_app' ||
        Object.values(role).some((value) => value === true)
      )
        throw new Error('Unsafe runtime role');
      const {
        rows: [permissions],
      } = await runtimePool.query(
        "SELECT has_schema_privilege(current_user,'public','CREATE') AS can_create, has_table_privilege(current_user,'public._prisma_migrations','SELECT') AS migration_access",
      );
      if (permissions.can_create || permissions.migration_access)
        throw new Error('Runtime has unexpected schema/migration access');
      for (const table of tableNames) {
        const {
          rows: [rights],
        } = await runtimePool.query(
          "SELECT has_table_privilege(current_user,$1,'SELECT') AND has_table_privilege(current_user,$1,'INSERT') AND has_table_privilege(current_user,$1,'UPDATE') AND has_table_privilege(current_user,$1,'DELETE') AS dml",
          [`public.${table}`],
        );
        if (!rights.dml) throw new Error('Missing runtime table permissions');
      }
      console.log(
        'Pooled TLS authentication and runtime privilege checks passed. No data was written.',
      );
    } finally {
      await runtimePool.end();
    }
  }
} catch {
  console.error(
    `Neon ${mode} did not complete. Check the private file, selected production branch, exact target, permissions and previous step. No credentials displayed.`,
  );
  process.exitCode = 1;
} finally {
  await pool?.end();
}
