import { randomBytes, randomUUID } from 'node:crypto';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { pino } from 'pino';
import { createApp } from './app.js';
import { createDatabase } from './db.js';
import { hashPassword } from './passwords.js';
import { bangladeshDate } from './dates.js';

const connection = process.env.TEST_DATABASE_URL;
const origin = 'http://127.0.0.1:5173';

describe.skipIf(!connection)('authenticated PostgreSQL API', () => {
  if (connection && !new URL(connection).pathname.endsWith('_test'))
    throw new Error('API tests require an isolated _test database.');
  const database = createDatabase(connection!);
  const app = createApp(pino({ level: 'silent' }), {
    ...database,
    security: {
      origin,
      sessionSecret: randomBytes(32).toString('hex'),
      secure: false,
      trustProxyHops: 0,
    },
  });
  const suffix = randomUUID();
  const adminEmail = `admin-${suffix}@example.invalid`;
  const memberEmail = `member-${suffix}@example.invalid`;
  const otherEmail = `other-${suffix}@example.invalid`;
  const password = 'A fictional test password 123!';
  let adminId: string;
  let memberId: string;
  let otherId: string;
  let projectId: string;
  let taskId: string;
  const admin = request.agent(app);
  const member = request.agent(app);
  const other = request.agent(app);
  let adminToken: string;
  let memberToken: string;
  let otherToken: string;
  let oldCookie: string;

  async function signIn(
    agent: ReturnType<typeof request.agent>,
    email: string,
  ) {
    const csrf = await agent.get('/api/auth/csrf').expect(200);
    const response = await agent
      .post('/api/auth/login')
      .set('Origin', origin)
      .set('x-csrf-token', csrf.body.csrfToken)
      .send({ email, password })
      .expect(200);
    expect(response.body.csrfToken).not.toBe(csrf.body.csrfToken);
    expect(JSON.stringify(response.headers['set-cookie'])).toContain(
      'HttpOnly',
    );
    expect(JSON.stringify(response.headers['set-cookie'])).toContain(
      'SameSite=Lax',
    );
    const cookies = csrf.headers['set-cookie'];
    const anonymousCookie = Array.isArray(cookies) ? cookies[0] : cookies;
    if (!anonymousCookie)
      throw new Error('CSRF bootstrap did not issue a session cookie');
    await request(app)
      .get('/api/auth/me')
      .set('Cookie', anonymousCookie.split(';')[0]!)
      .expect(401);
    return response;
  }
  it('allows members to list only minimal assignee identities for filtering', async () => {
    const response = await member.get('/api/users/assignees').expect(200);
    expect(response.body.users).toContainEqual({
      id: memberId,
      name: 'API Member',
    });
    expect(
      response.body.users.every(
        (user: Record<string, unknown>) =>
          Object.keys(user).sort().join(',') === 'id,name',
      ),
    ).toBe(true);
    await request(app).get('/api/users/assignees').expect(401);
  });
  beforeAll(async () => {
    const passwordHash = await hashPassword(password);
    adminId = (
      await database.db.user.create({
        data: {
          name: 'API Admin',
          email: adminEmail,
          passwordHash,
          role: 'ADMIN',
        },
      })
    ).id;
    memberId = (
      await database.db.user.create({
        data: { name: 'API Member', email: memberEmail, passwordHash },
      })
    ).id;
    otherId = (
      await database.db.user.create({
        data: { name: 'API Other', email: otherEmail, passwordHash },
      })
    ).id;
    const adminLogin = await signIn(admin, adminEmail);
    adminToken = adminLogin.body.csrfToken;
    const cookieHeader = adminLogin.headers['set-cookie'];
    const cookie = Array.isArray(cookieHeader) ? cookieHeader[0] : cookieHeader;
    if (!cookie) throw new Error('Login did not issue a session cookie');
    oldCookie = cookie.split(';')[0]!;
    memberToken = (await signIn(member, memberEmail)).body.csrfToken;
    otherToken = (await signIn(other, otherEmail)).body.csrfToken;
  }, 30_000);
  afterAll(async () => {
    const ids = [adminId, memberId, otherId].filter(Boolean);
    await database.db.task.deleteMany({ where: { createdById: { in: ids } } });
    await database.db.project.deleteMany({
      where: { createdById: { in: ids } },
    });
    await database.db.user.deleteMany({
      where: {
        OR: [
          { id: { in: ids } },
          { email: `registered-${suffix}@example.invalid` },
        ],
      },
    });
    await database.pool.query(
      "DELETE FROM sessions WHERE sess->>'userId' = ANY($1::text[])",
      [ids],
    );
    app.locals.sessionStore.close();
    await database.close();
  });

  it('requires authentication and does not expose password hashes', async () => {
    await request(app).get('/api/projects').expect(401);
    const response = await member.get('/api/auth/me').expect(200);
    expect(response.body.user.role).toBe('TEAM_MEMBER');
    expect(response.body.user).not.toHaveProperty('passwordHash');
    expect(response.headers['cache-control']).toBe('no-store');
  });
  it('registers only members and rejects privilege escalation and duplicate emails', async () => {
    const agent = request.agent(app);
    const csrf = (await agent.get('/api/auth/csrf')).body.csrfToken;
    const data = {
      name: 'Registered',
      email: `registered-${suffix}@example.invalid`,
      password,
    };
    await agent
      .post('/api/auth/register')
      .set('Origin', origin)
      .set('x-csrf-token', csrf)
      .send({ ...data, role: 'ADMIN' })
      .expect(400);
    const response = await agent
      .post('/api/auth/register')
      .set('Origin', origin)
      .set('x-csrf-token', csrf)
      .send(data)
      .expect(201);
    expect(response.body.user.role).toBe('TEAM_MEMBER');
    await agent
      .post('/api/auth/register')
      .set('Origin', origin)
      .set('x-csrf-token', csrf)
      .send(data)
      .expect(409);
  });
  it('enforces CSRF and origin checks as well as Admin permissions', async () => {
    await admin
      .post('/api/projects')
      .send({ name: 'Unauthorized', description: 'No token' })
      .expect(403);
    await admin
      .post('/api/projects')
      .set('Origin', 'https://untrusted.invalid')
      .set('x-csrf-token', adminToken)
      .send({ name: 'Wrong origin', description: 'Rejected' })
      .expect(403);
    await member
      .post('/api/projects')
      .set('Origin', origin)
      .set('x-csrf-token', memberToken)
      .send({ name: 'Member project', description: 'Rejected' })
      .expect(403);
    const response = await admin
      .post('/api/projects')
      .set('Origin', origin)
      .set('x-csrf-token', adminToken)
      .send({ name: `API ${suffix}`, description: 'Integration fixture' })
      .expect(201);
    projectId = response.body.project.id;
  });
  it('validates dates/references and creates an overdue task', async () => {
    const data = {
      title: `Searchable ${suffix}`,
      description: 'Integration task',
      projectId,
      assigneeId: memberId,
      dueDate: '2020-01-01',
      priority: 'HIGH',
    };
    await admin
      .post('/api/tasks')
      .set('Origin', origin)
      .set('x-csrf-token', adminToken)
      .send({ ...data, dueDate: '2025-02-29' })
      .expect(400);
    await admin
      .post('/api/tasks')
      .set('Origin', origin)
      .set('x-csrf-token', adminToken)
      .send({ ...data, projectId: randomUUID() })
      .expect(400);
    const response = await admin
      .post('/api/tasks')
      .set('Origin', origin)
      .set('x-csrf-token', adminToken)
      .send(data)
      .expect(201);
    taskId = response.body.task.id;
    expect(response.body.task.dueDate).toBe('2020-01-01');
    expect(response.body.task.status).toBe('TODO');
    await admin
      .delete(`/api/projects/${projectId}`)
      .set('Origin', origin)
      .set('x-csrf-token', adminToken)
      .expect(409);
  });
  it('allows only assigned status changes and preserves PATCH omissions', async () => {
    await other
      .patch(`/api/tasks/${taskId}/status`)
      .set('Origin', origin)
      .set('x-csrf-token', otherToken)
      .send({ status: 'COMPLETED' })
      .expect(403);
    await member
      .patch(`/api/tasks/${taskId}/status`)
      .set('Origin', origin)
      .set('x-csrf-token', memberToken)
      .send({ status: 'IN_PROGRESS', priority: 'LOW' })
      .expect(400);
    await member
      .patch(`/api/tasks/${taskId}`)
      .set('Origin', origin)
      .set('x-csrf-token', memberToken)
      .send({ title: 'Forbidden' })
      .expect(403);
    await member
      .patch(`/api/tasks/${taskId}/status`)
      .set('Origin', origin)
      .set('x-csrf-token', memberToken)
      .send({ status: 'IN_PROGRESS' })
      .expect(200);
    const response = await admin
      .patch(`/api/tasks/${taskId}`)
      .set('Origin', origin)
      .set('x-csrf-token', adminToken)
      .send({ title: `Revised ${suffix}` })
      .expect(200);
    expect(response.body.task.status).toBe('IN_PROGRESS');
    expect(response.body.task.priority).toBe('HIGH');
    expect(response.body.task.description).toBe('Integration task');
  });
  it('combines all filters with search, sorting and bounded pagination', async () => {
    const response = await member
      .get('/api/tasks')
      .query({
        projectId,
        assigneeId: memberId,
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        search: suffix,
        pageSize: 1,
        sortBy: 'dueDate',
        sortOrder: 'asc',
      })
      .expect(200);
    expect(response.body.pagination.total).toBe(1);
    expect(response.body.tasks[0].id).toBe(taskId);
    await member.get('/api/tasks').query({ pageSize: 101 }).expect(400);
    await member
      .get('/api/tasks')
      .query({ sortBy: 'password_hash' })
      .expect(400);
  });
  it('synchronizes notices without duplicates, protects read ownership and preserves read state', async () => {
    const first = await member.get('/api/notifications').expect(200);
    const notification = first.body.notifications.find(
      (value: { taskId: string }) => value.taskId === taskId,
    );
    expect(notification).toBeDefined();
    await other
      .patch(`/api/notifications/${notification.id}/read`)
      .set('Origin', origin)
      .set('x-csrf-token', otherToken)
      .expect(404);
    await member
      .patch(`/api/notifications/${notification.id}/read`)
      .set('Origin', origin)
      .set('x-csrf-token', memberToken)
      .expect(204);
    const again = await member.get('/api/notifications').expect(200);
    expect(
      again.body.notifications.filter(
        (value: { taskId: string }) => value.taskId === taskId,
      ),
    ).toHaveLength(1);
    expect(again.body.unreadCount).toBe(0);
    expect(
      (await other.get('/api/notifications')).body.notifications,
    ).toHaveLength(0);
    const adminNotices = await admin.get('/api/notifications').expect(200);
    expect(
      adminNotices.body.notifications.some(
        (value: { taskId: string }) => value.taskId === taskId,
      ),
    ).toBe(true);
  });
  it('counts completed/pending/overdue work consistently and treats today as not overdue', async () => {
    const before = (await admin.get('/api/dashboard').expect(200)).body;
    await member
      .patch(`/api/tasks/${taskId}/status`)
      .set('Origin', origin)
      .set('x-csrf-token', memberToken)
      .send({ status: 'COMPLETED' })
      .expect(200);
    const after = (await admin.get('/api/dashboard').expect(200)).body;
    expect(after.completedTasks).toBe(before.completedTasks + 1);
    expect(after.overdueTasks).toBe(before.overdueTasks - 1);
    expect(after.pendingTasks).toBe(before.pendingTasks - 1);
    expect(
      after.projects.find((value: { id: string }) => value.id === projectId)
        .progress,
    ).toBe(100);
    expect(
      (await member.get('/api/notifications')).body.notifications,
    ).toHaveLength(0);
    await admin
      .patch(`/api/tasks/${taskId}`)
      .set('Origin', origin)
      .set('x-csrf-token', adminToken)
      .send({ status: 'TODO', dueDate: bangladeshDate() })
      .expect(200);
    expect((await admin.get('/api/dashboard')).body.overdueTasks).toBe(
      after.overdueTasks,
    );
    await admin
      .patch(`/api/tasks/${taskId}`)
      .set('Origin', origin)
      .set('x-csrf-token', adminToken)
      .send({ dueDate: '2020-01-01' })
      .expect(200);
    expect((await member.get('/api/notifications')).body.unreadCount).toBe(0);
  });
  it('creates a new notice for a changed overdue deadline and removes old assignee visibility', async () => {
    await admin
      .patch(`/api/tasks/${taskId}`)
      .set('Origin', origin)
      .set('x-csrf-token', adminToken)
      .send({ dueDate: '2019-12-31' })
      .expect(200);
    expect((await member.get('/api/notifications')).body.unreadCount).toBe(1);
    await admin
      .patch(`/api/tasks/${taskId}`)
      .set('Origin', origin)
      .set('x-csrf-token', adminToken)
      .send({ assigneeId: otherId })
      .expect(200);
    expect(
      (await member.get('/api/notifications')).body.notifications,
    ).toHaveLength(0);
    expect((await other.get('/api/notifications')).body.unreadCount).toBe(1);
  });
  it('rejects expired sessions even if the session record still exists', async () => {
    const agent = request.agent(app);
    const response = await signIn(agent, otherEmail);
    expect(response.body.csrfToken).toHaveLength(64);
    await database.pool.query(
      "UPDATE sessions SET sess = jsonb_set(sess::jsonb, '{issuedAt}', to_jsonb($2::bigint))::json WHERE sess->>'userId' = $1",
      [otherId, Date.now() - 9 * 60 * 60 * 1000],
    );
    await agent.get('/api/auth/me').expect(401);
  });
  it('throttles repeated invalid logins using shared database state', async () => {
    const agent = request.agent(app);
    const csrf = (await agent.get('/api/auth/csrf')).body.csrfToken;
    const email = `missing-${suffix}@example.invalid`;
    for (let attempt = 0; attempt < 5; attempt++)
      await agent
        .post('/api/auth/login')
        .set('Origin', origin)
        .set('x-csrf-token', csrf)
        .send({ email, password })
        .expect(401);
    const response = await agent
      .post('/api/auth/login')
      .set('Origin', origin)
      .set('x-csrf-token', csrf)
      .send({ email, password })
      .expect(429);
    expect(response.headers['retry-after']).toBe('900');
  }, 30_000);
  it('deletes tasks/projects and invalidates stored sessions on logout', async () => {
    await admin
      .delete(`/api/tasks/${taskId}`)
      .set('Origin', origin)
      .set('x-csrf-token', adminToken)
      .expect(204);
    await admin
      .delete(`/api/projects/${projectId}`)
      .set('Origin', origin)
      .set('x-csrf-token', adminToken)
      .expect(204);
    await admin
      .post('/api/auth/logout')
      .set('Origin', origin)
      .set('x-csrf-token', adminToken)
      .expect(204);
    await request(app).get('/api/auth/me').set('Cookie', oldCookie).expect(401);
  });
});
