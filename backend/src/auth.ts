import { Router } from 'express';
import type { Database } from './db.js';
import { ApiError } from './errors.js';
import { hashPassword, verifyPassword } from './passwords.js';
import * as input from './validation.js';
import {
  consumeAuthLimit,
  cookieName,
  currentUser,
  identitySelect,
  newToken,
  requireIdentity,
} from './security.js';
import type { SecurityConfig } from './security.js';

export function authRoutes(db: Database, config: SecurityConfig) {
  const router = Router();
  router.get('/csrf', async (req, res) => {
    await consumeAuthLimit(db, config.sessionSecret, `csrf:${req.ip}`, 100);
    req.session.csrf ??= newToken();
    res.json({ csrfToken: req.session.csrf });
  });
  router.post('/register', async (req, res) => {
    const data = input.registration.parse(req.body);
    await consumeAuthLimit(db, config.sessionSecret, `register:${req.ip}`, 10);
    const user = await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: await hashPassword(data.password),
        role: 'TEAM_MEMBER',
      },
      select: identitySelect,
    });
    res.status(201).json({ user });
  });
  router.post('/login', async (req, res) => {
    const data = input.login.parse(req.body);
    await consumeAuthLimit(db, config.sessionSecret, `login-ip:${req.ip}`, 30);
    await consumeAuthLimit(
      db,
      config.sessionSecret,
      `login-email:${data.email}`,
      5,
    );
    const user = await db.user.findUnique({ where: { email: data.email } });
    if (!(await verifyPassword(data.password, user?.passwordHash)) || !user)
      throw new ApiError(
        401,
        'INVALID_CREDENTIALS',
        'Email or password is incorrect.',
      );
    await new Promise<void>((resolve, reject) =>
      req.session.regenerate((error) => (error ? reject(error) : resolve())),
    );
    req.session.userId = user.id;
    req.session.issuedAt = Date.now();
    req.session.csrf = newToken();
    await new Promise<void>((resolve, reject) =>
      req.session.save((error) => (error ? reject(error) : resolve())),
    );
    // Awaited opportunistic cleanup: no unreliable background timer on function hosting.
    await db.$executeRaw`DELETE FROM sessions WHERE expire < now()`;
    await db.authRateLimit.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      csrfToken: req.session.csrf,
    });
  });
  router.get('/me', requireIdentity(db), (req, res) =>
    res.json({ user: currentUser(req) }),
  );
  router.post('/logout', requireIdentity(db), async (req, res) => {
    await new Promise<void>((resolve, reject) =>
      req.session.destroy((error) => (error ? reject(error) : resolve())),
    );
    res
      .clearCookie(cookieName, {
        path: '/',
        httpOnly: true,
        secure: config.secure,
        sameSite: 'lax',
      })
      .status(204)
      .end();
  });
  return router;
}
