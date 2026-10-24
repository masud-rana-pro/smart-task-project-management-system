import { pino } from 'pino';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from './app.js';
import { parseEnvironment } from './config.js';

const app = createApp(pino({ level: 'silent' }));

describe('API foundation', () => {
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
  it('rejects invalid ports and does not reveal supplied values', () => {
    expect(() => parseEnvironment({ PORT: 'not-a-port-secret' })).toThrow(
      'Invalid environment fields: PORT',
    );
    expect(parseEnvironment({ PORT: '3001' }).PORT).toBe(3001);
  });
});
