import { randomUUID } from 'node:crypto';
import { test as base, expect } from '@playwright/test';
import pg from 'pg';
import { config } from 'dotenv';
import { hashPassword } from '../../backend/src/passwords';
config({ path: 'backend/.env', quiet: true });
type Workspace = {
  adminEmail: string;
  memberEmail: string;
  registrationEmail: string;
  password: string;
  project: string;
  ownTask: string;
  otherTask: string;
  adminId: string;
  memberId: string;
  projectId: string;
};
export const test = base.extend<{ workspace: Workspace }>({
  // Playwright requires a destructured fixture argument, even without dependencies.
  // eslint-disable-next-line no-empty-pattern
  workspace: async ({}, use) => {
    const connection = process.env.TEST_DATABASE_URL;
    if (!connection || !new URL(connection).pathname.endsWith('_test'))
      throw new Error('E2E fixtures require isolated _test database');
    const pool = new pg.Pool({ connectionString: connection });
    const tag = randomUUID();
    const adminId = randomUUID();
    const memberId = randomUUID();
    const projectId = randomUUID();
    const password = 'Fictional browser test passphrase!';
    const adminEmail = `browser-admin-${tag}@example.invalid`;
    const memberEmail = `browser-member-${tag}@example.invalid`;
    const registrationEmail = `browser-register-${tag}@example.invalid`;
    const project = `Browser project ${tag.slice(0, 8)}`;
    const ownTask = `Review checklist ${tag.slice(0, 8)}`;
    const otherTask = `Release notes ${tag.slice(0, 8)}`;
    try {
      const hash = await hashPassword(password);
      await pool.query(
        'INSERT INTO users (id,name,email,password_hash,role,updated_at) VALUES ($1,$2,$3,$4,$5,now()),($6,$7,$8,$4,$9,now())',
        [
          adminId,
          'Browser Admin',
          adminEmail,
          hash,
          'ADMIN',
          memberId,
          'Browser Member',
          memberEmail,
          'TEAM_MEMBER',
        ],
      );
      await pool.query(
        'INSERT INTO projects (id,name,description,created_by_id,updated_at) VALUES ($1,$2,$3,$4,now())',
        [projectId, project, 'Fictional browser workflow', adminId],
      );
      await pool.query(
        'INSERT INTO tasks (id,title,description,project_id,assignee_id,created_by_id,status,priority,due_date,updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,now()),($10,$11,$12,$4,$6,$6,$7,$13,$9,now())',
        [
          randomUUID(),
          ownTask,
          'Assigned to the member',
          projectId,
          memberId,
          adminId,
          'TODO',
          'HIGH',
          '2020-01-01',
          randomUUID(),
          otherTask,
          'Assigned to the administrator',
          'LOW',
        ],
      );
      await use({
        adminEmail,
        memberEmail,
        registrationEmail,
        password,
        project,
        ownTask,
        otherTask,
        adminId,
        memberId,
        projectId,
      });
    } finally {
      const ids = [adminId, memberId];
      await pool.query(
        'DELETE FROM tasks WHERE created_by_id = ANY($1::uuid[])',
        [ids],
      );
      await pool.query(
        'DELETE FROM projects WHERE created_by_id = ANY($1::uuid[])',
        [ids],
      );
      await pool.query(
        "DELETE FROM sessions WHERE sess->>'userId' IN (SELECT id::text FROM users WHERE id = ANY($1::uuid[]) OR email = $2)",
        [ids, registrationEmail],
      );
      await pool.query(
        'DELETE FROM users WHERE id = ANY($1::uuid[]) OR email = $2',
        [ids, registrationEmail],
      );
      await pool.end();
    }
  },
});
export { expect };
