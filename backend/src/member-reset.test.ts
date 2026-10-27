import { randomBytes, randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { pino } from 'pino';
import { createDatabase } from './db.js';
import { createApp } from './app.js';
import { hashPassword, verifyPassword } from './passwords.js';

const connection = process.env.TEST_DATABASE_URL;
describe.skipIf(!connection)('Admin-only member password reset', () => {
  if (connection && !new URL(connection).pathname.endsWith('_test'))
    throw new Error('Isolated test database required');
  const database = createDatabase(connection!);
  const origin = 'http://127.0.0.1:5173';
  const app = createApp(pino({ level: 'silent' }), {
    ...database,
    security: {
      origin,
      sessionSecret: randomBytes(32).toString('hex'),
      secure: false,
      trustProxyHops: 0,
    },
  });
  const ids: [string, string] = [randomUUID(), randomUUID()];
  const emails = ids.map((id) => `reset-${id}@example.invalid`);
  const password = 'Original member password 123!';
  const nextPassword = 'Replacement member password 456!';
  const admin = request.agent(app);
  const member = request.agent(app);
  let adminToken: string;
  let memberToken: string;
  async function login(
    agent: ReturnType<typeof request.agent>,
    email: string,
    supplied = password,
    expected = 200,
  ) {
    const csrf = await agent.get('/api/auth/csrf');
    return agent
      .post('/api/auth/login')
      .set('Origin', origin)
      .set('x-csrf-token', csrf.body.csrfToken)
      .send({ email, password: supplied })
      .expect(expected);
  }
  beforeAll(async () => {
    const passwordHash = await hashPassword(password);
    for (const [index, id] of ids.entries())
      await database.db.user.create({
        data: {
          id,
          name: `Reset fixture ${index}`,
          email: emails[index]!,
          passwordHash,
          role: index === 0 ? 'ADMIN' : 'TEAM_MEMBER',
        },
      });
    adminToken = (await login(admin, emails[0]!)).body.csrfToken;
    memberToken = (await login(member, emails[1]!)).body.csrfToken;
  }, 30_000);
  afterAll(async () => {
    await database.pool.query(
      "DELETE FROM sessions WHERE sess->>'userId'=ANY($1::text[])",
      [ids],
    );
    await database.db.user.deleteMany({ where: { id: { in: ids } } });
    app.locals.sessionStore.close();
    await database.close();
  });
  it('restricts the member directory to Admin and returns only safe fields', async () => {
    await request(app).get('/api/auth/members').expect(401);
    await member.get('/api/auth/members').expect(403);
    const response = await admin.get('/api/auth/members').expect(200);
    expect(response.body.users).toContainEqual({
      id: ids[1],
      name: 'Reset fixture 1',
      email: emails[1],
    });
    expect(
      response.body.users.every(
        (user: Record<string, unknown>) =>
          Object.keys(user).sort().join(',') === 'email,id,name',
      ),
    ).toBe(true);
  });
  it('rejects anonymous/member requests, missing CSRF, invalid inputs and Admin targets', async () => {
    const path = `/api/auth/members/${ids[1]}/reset-password`;
    const anonymous = request.agent(app);
    const token = (await anonymous.get('/api/auth/csrf')).body.csrfToken;
    await anonymous
      .post(path)
      .set('Origin', origin)
      .set('x-csrf-token', token)
      .send({ password: nextPassword })
      .expect(401);
    await member
      .post(path)
      .set('Origin', origin)
      .set('x-csrf-token', memberToken)
      .send({ password: nextPassword })
      .expect(403);
    await admin
      .post(path)
      .set('Origin', origin)
      .send({ password: nextPassword })
      .expect(403);
    for (const body of [
      { password: 'short' },
      { password: nextPassword, role: 'ADMIN' },
    ])
      await admin
        .post(path)
        .set('Origin', origin)
        .set('x-csrf-token', adminToken)
        .send(body)
        .expect(400);
    for (const id of [ids[0], randomUUID()])
      await admin
        .post(`/api/auth/members/${id}/reset-password`)
        .set('Origin', origin)
        .set('x-csrf-token', adminToken)
        .send({ password: nextPassword })
        .expect(404);
    expect(
      await verifyPassword(
        password,
        (await database.db.user.findUniqueOrThrow({ where: { id: ids[1] } }))
          .passwordHash,
      ),
    ).toBe(true);
  });
  it('updates the hash, revokes sessions and rejects a resurrected pre-reset session', async () => {
    const {
      rows: [previous],
    } = await database.pool.query(
      "SELECT * FROM sessions WHERE sess->>'userId'=$1",
      [ids[1]],
    );
    await admin
      .post(`/api/auth/members/${ids[1]}/reset-password`)
      .set('Origin', origin)
      .set('x-csrf-token', adminToken)
      .send({ password: nextPassword })
      .expect(204);
    const stored = await database.db.user.findUniqueOrThrow({
      where: { id: ids[1] },
    });
    expect(stored.email).toBe(emails[1]);
    expect(stored.role).toBe('TEAM_MEMBER');
    expect(await verifyPassword(nextPassword, stored.passwordHash)).toBe(true);
    expect(await verifyPassword(password, stored.passwordHash)).toBe(false);
    expect(
      (
        await database.pool.query(
          "SELECT sid FROM sessions WHERE sess->>'userId'=$1",
          [ids[1]],
        )
      ).rowCount,
    ).toBe(0);
    // Simulate an in-flight request saving an old session after the reset committed.
    await database.pool.query(
      'INSERT INTO sessions(sid,sess,expire) VALUES($1,$2,$3)',
      [previous.sid, previous.sess, previous.expire],
    );
    await member.get('/api/auth/me').expect(401);
    const fresh = request.agent(app);
    await login(fresh, emails[1]!, password, 401);
    const result = await login(fresh, emails[1]!, nextPassword);
    expect(result.body.user.role).toBe('TEAM_MEMBER');
    expect(JSON.stringify(result.body)).not.toContain('$scrypt$');
    await fresh.get('/api/auth/me').expect(200);
    await admin.get('/api/auth/me').expect(200);
  }, 30_000);
  it('bounds reset attempts per authenticated Admin', async () => {
    for (let attempt = 0; attempt < 7; attempt++)
      await admin
        .post(`/api/auth/members/${randomUUID()}/reset-password`)
        .set('Origin', origin)
        .set('x-csrf-token', adminToken)
        .send({ password: nextPassword })
        .expect(404);
    const response = await admin
      .post(`/api/auth/members/${ids[1]}/reset-password`)
      .set('Origin', origin)
      .set('x-csrf-token', adminToken)
      .send({ password: 'Another replacement password 789!' })
      .expect(429);
    expect(response.headers['retry-after']).toBe('900');
    expect(
      await verifyPassword(
        nextPassword,
        (await database.db.user.findUniqueOrThrow({ where: { id: ids[1] } }))
          .passwordHash,
      ),
    ).toBe(true);
  });
});
