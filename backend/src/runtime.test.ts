import { randomBytes } from 'node:crypto';
import { afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createRuntime } from './runtime.js';

const connection = process.env.TEST_DATABASE_URL;
describe.skipIf(!connection)('production runtime composition', () => {
  if (connection && !new URL(connection).pathname.endsWith('_test'))
    throw new Error('Runtime tests require the isolated test database.');
  const runtime = createRuntime({
    DATABASE_URL: connection!,
    SESSION_SECRET: randomBytes(32).toString('hex'),
    NODE_ENV: 'production',
    APP_ORIGIN: 'https://demo.example.invalid',
    TRUST_PROXY_HOPS: '1',
    LOG_LEVEL: 'silent',
  });
  let createdSessionId: string | undefined;
  afterAll(async () => {
    runtime.app.locals.sessionStore.close();
    if (createdSessionId)
      await runtime.database.db.session.deleteMany({
        where: { sid: createdSessionId },
      });
    await runtime.database.close();
  });
  it('checks the database through the composed production application', async () => {
    const response = await request(runtime.app).get('/api/ready').expect(200);
    expect(response.body).toEqual({ status: 'ready' });
    await request(runtime.app).get('/api/projects').expect(401);
  });
  it('issues a secure session through the reviewed proxy configuration', async () => {
    const response = await request(runtime.app)
      .get('/api/auth/csrf')
      .set('X-Forwarded-Proto', 'https')
      .expect(200);
    const cookie = response.headers['set-cookie']?.[0]
      ?.split(';')[0]
      ?.split('=')[1];
    if (cookie)
      createdSessionId = decodeURIComponent(cookie).slice(2).split('.')[0];
    expect(response.body.csrfToken).toMatch(/^[a-f0-9]{64}$/);
    expect(JSON.stringify(response.headers['set-cookie'])).toContain(
      '; Secure',
    );
    expect(JSON.stringify(response.headers['set-cookie'])).toContain(
      'HttpOnly',
    );
  });
});
