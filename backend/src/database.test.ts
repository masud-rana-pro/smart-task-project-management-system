import pg from 'pg';
import { describe, expect, it } from 'vitest';

const databaseUrl = process.env.TEST_DATABASE_URL;

describe.skipIf(!databaseUrl)('migrated test database', () => {
  it('contains the initial tables and protects projects that contain tasks', async () => {
    const url = new URL(databaseUrl!);
    if (!url.pathname.endsWith('_test'))
      throw new Error(
        'Database tests require a database name ending in _test.',
      );
    const client = new pg.Client({ connectionString: databaseUrl });
    await client.connect();
    try {
      const tables = await client.query<{ tablename: string }>(
        "SELECT tablename FROM pg_tables WHERE schemaname = 'public'",
      );
      expect(tables.rows.map((row) => row.tablename)).toEqual(
        expect.arrayContaining([
          'users',
          'projects',
          'tasks',
          'sessions',
          'notifications',
          'auth_rate_limits',
        ]),
      );
      await client.query('BEGIN');
      const userId = '11111111-1111-4111-8111-111111111111';
      const projectId = '22222222-2222-4222-8222-222222222222';
      await client.query(
        'INSERT INTO users (id, name, email, password_hash, role, updated_at) VALUES ($1, $2, $3, $4, $5, now())',
        [
          userId,
          'Migration Test',
          'migration-test@example.invalid',
          'not-a-real-password-hash',
          'ADMIN',
        ],
      );
      await client.query(
        'INSERT INTO projects (id, name, description, created_by_id, updated_at) VALUES ($1, $2, $3, $4, now())',
        [projectId, 'Migration test', '', userId],
      );
      await client.query(
        'INSERT INTO tasks (id, title, project_id, assignee_id, created_by_id, due_date, updated_at) VALUES ($1, $2, $3, $4, $4, $5, now())',
        [
          '33333333-3333-4333-8333-333333333333',
          'FK test',
          projectId,
          userId,
          '2026-10-26',
        ],
      );
      await expect(
        client.query('DELETE FROM projects WHERE id = $1', [projectId]),
      ).rejects.toMatchObject({ code: '23503' });
    } finally {
      await client.query('ROLLBACK');
      await client.end();
    }
  });
});
