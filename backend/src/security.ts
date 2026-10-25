import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import type { Request, RequestHandler } from 'express';
import type { Pool } from 'pg';
import type { Database } from './db.js';
import { ApiError } from './errors.js';

export type Identity = {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'TEAM_MEMBER';
};
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    csrf?: string;
    issuedAt?: number;
  }
}
declare module 'express-serve-static-core' {
  interface Request {
    identity?: Identity;
  }
}

export const identitySelect = {
  id: true,
  name: true,
  email: true,
  role: true,
} as const;
export const cookieName = 'smart_task.sid';
export const sessionLifetime = 8 * 60 * 60 * 1000;
export type SecurityConfig = {
  sessionSecret: string;
  origin: string;
  secure: boolean;
  trustProxyHops: number;
};

export function createSessionMiddleware(pool: Pool, config: SecurityConfig) {
  const Store = connectPgSimple(session);
  const store = new Store({
    pool,
    tableName: 'sessions',
    createTableIfMissing: false,
    pruneSessionInterval: false,
    disableTouch: true,
  });
  const middleware = session({
    store,
    name: cookieName,
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: config.secure,
      sameSite: 'lax',
      maxAge: sessionLifetime,
      path: '/',
    },
  });
  return { middleware, store };
}
export const newToken = () => randomBytes(32).toString('hex');
export const csrfProtection =
  (origin: string): RequestHandler =>
  (req, _res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      next();
      return;
    }
    const token = req.get('x-csrf-token');
    if (
      req.get('origin') !== origin ||
      !token ||
      !/^[a-f0-9]{64}$/.test(token) ||
      !req.session.csrf ||
      !timingSafeEqual(Buffer.from(token), Buffer.from(req.session.csrf))
    ) {
      next(
        new ApiError(
          403,
          'CSRF_REJECTED',
          'Refresh the security token and retry from the application.',
        ),
      );
      return;
    }
    next();
  };
export function requireIdentity(db: Database): RequestHandler {
  return async (req, _res, next) => {
    if (
      !req.session.userId ||
      !req.session.issuedAt ||
      Date.now() - req.session.issuedAt > sessionLifetime
    ) {
      throw new ApiError(401, 'UNAUTHENTICATED', 'Please log in.');
    }
    const user = await db.user.findUnique({
      where: { id: req.session.userId },
      select: identitySelect,
    });
    if (!user) throw new ApiError(401, 'UNAUTHENTICATED', 'Please log in.');
    req.identity = user;
    next();
  };
}
export const requireAdmin: RequestHandler = (req, _res, next) => {
  if (req.identity?.role !== 'ADMIN')
    throw new ApiError(
      403,
      'FORBIDDEN',
      'Administrator permission is required.',
    );
  next();
};
export const currentUser = (req: Request) => {
  if (!req.identity)
    throw new ApiError(401, 'UNAUTHENTICATED', 'Please log in.');
  return req.identity;
};

// Atomic fixed-window counters shared by all API instances. Keys never contain raw email/IP.
export async function consumeAuthLimit(
  db: Database,
  secret: string,
  key: string,
  limit: number,
) {
  const keyHash = createHmac('sha256', secret).update(key).digest('hex');
  const rows = await db.$queryRaw<{ hits: number }[]>`
    INSERT INTO auth_rate_limits (key_hash, hits, expires_at) VALUES (${keyHash}, 1, now() + interval '15 minutes')
    ON CONFLICT (key_hash) DO UPDATE SET
      hits = CASE WHEN auth_rate_limits.expires_at <= now() THEN 1 ELSE auth_rate_limits.hits + 1 END,
      expires_at = CASE WHEN auth_rate_limits.expires_at <= now() THEN now() + interval '15 minutes' ELSE auth_rate_limits.expires_at END
    RETURNING hits`;
  if ((rows[0]?.hits ?? limit + 1) > limit)
    throw new ApiError(
      429,
      'RATE_LIMITED',
      'Too many attempts. Retry in 15 minutes.',
    );
}
