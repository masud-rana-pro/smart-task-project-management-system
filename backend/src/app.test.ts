import { pino } from 'pino';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from './app.js';
import { parseEnvironment, parseApplicationEnvironment } from './config.js';
import { Pool } from 'pg';
import type { Database } from './db.js';

const app = createApp(pino({ level: 'silent' }));

describe('API foundation', () => {
  it('reports unavailable readiness without leaking database errors while liveness remains up', async () => {
    const pool = new Pool();
    const failingDb = {
      $queryRaw: async () => {
        throw new Error('private database failure detail');
      },
    } as unknown as Database;
    const brokenApp = createApp(pino({ level: 'silent' }), {
      db: failingDb,
      pool,
      security: {
        origin: 'http://127.0.0.1:5173',
        sessionSecret: 'a'.repeat(64),
        secure: false,
        trustProxyHops: 0,
      },
    });
    try {
      const response = await request(brokenApp).get('/api/ready').expect(503);
      expect(response.body).toEqual({ status: 'unavailable' });
      await request(brokenApp).get('/api/health').expect(200);
    } finally {
      brokenApp.locals.sessionStore.close();
      await pool.end();
    }
  });
  it('reports liveness without exposing configuration or claiming database health', async () => {
    const response = await request(app).get('/api/health').expect(200);
    expect(response.body).toEqual({ status: 'ok' });
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.headers['x-powered-by']).toBeUndefined();
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });

  it('returns a structured 404 instead of HTML', async () => {
    const response = await request(app).get('/api/unknown').expect(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });

  it('handles malformed JSON without leaking parser details', async () => {
    const response = await request(app)
      .post('/api/unknown')
      .set('Content-Type', 'application/json')
      .send('{bad')
      .expect(400);
    expect(response.body).toEqual({
      error: {
        code: 'INVALID_JSON',
        message: 'Request body must be valid JSON.',
      },
    });
  });

  it('bounds incoming request size', async () => {
    const response = await request(app)
      .post('/api/unknown')
      .send({ data: 'x'.repeat(40_000) })
      .expect(413);
    expect(response.body.error.code).toBe('PAYLOAD_TOO_LARGE');
  });
});

describe('environment validation', () => {
  it('requires an exact HTTPS production origin and a bounded proxy setting', () => {
    const values = {
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://example:fictional@127.0.0.1:5432/example',
      SESSION_SECRET: 'a'.repeat(64),
      APP_ORIGIN: 'https://app.example.invalid',
    };
    expect(parseApplicationEnvironment(values).APP_ORIGIN).toBe(
      values.APP_ORIGIN,
    );
    expect(() =>
      parseApplicationEnvironment({
        ...values,
        APP_ORIGIN: 'http://app.example.invalid',
      }),
    ).toThrow('HTTPS');
    expect(() =>
      parseApplicationEnvironment({ ...values, TRUST_PROXY_HOPS: '2' }),
    ).toThrow('TRUST_PROXY_HOPS');
  });
  it('rejects invalid ports and does not reveal supplied values', () => {
    expect(() => parseEnvironment({ PORT: 'not-a-port-secret' })).toThrow(
      'Invalid environment fields: PORT',
    );
    expect(parseEnvironment({ PORT: '3001' }).PORT).toBe(3001);
  });
});
