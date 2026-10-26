import { Router } from 'express';
import type { Database } from './db.js';
import { createAuthService } from './services/auth-service.js';
import * as input from './validation.js';
import {
  consumeAuthLimit,
  cookieName,
  currentUser,
  newToken,
  requireIdentity,
  requireAdmin,
  credentialTag,
} from './security.js';
import type { SecurityConfig } from './security.js';

export function authRoutes(db: Database, config: SecurityConfig) {
  const router = Router();
  const service = createAuthService(db);
  router.get('/csrf', async (req, res) => {
    await consumeAuthLimit(db, config.sessionSecret, `csrf:${req.ip}`, 100);
    req.session.csrf ??= newToken();
    res.json({ csrfToken: req.session.csrf });
  });
  router.post('/register', async (req, res) => {
    const data = input.registration.parse(req.body);
    await consumeAuthLimit(db, config.sessionSecret, `register:${req.ip}`, 10);
    const user = await service.register(data);
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
    const user = await service.authenticate(data);
    await new Promise<void>((resolve, reject) =>
      req.session.regenerate((error) => (error ? reject(error) : resolve())),
    );
    req.session.userId = user.id;
    req.session.issuedAt = Date.now();
    req.session.credentialTag = credentialTag(
      config.sessionSecret,
      user.passwordHash,
    );
    req.session.csrf = newToken();
    await new Promise<void>((resolve, reject) =>
      req.session.save((error) => (error ? reject(error) : resolve())),
    );
    // Awaited opportunistic cleanup: no unreliable background timer on function hosting.
    await service.cleanupExpiredState();
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
  router.get(
    '/members',
    requireIdentity(db, config.sessionSecret),
    requireAdmin,
    async (_req, res) => {
      res.json(await service.listMembers());
    },
  );
  router.post(
    '/members/:id/reset-password',
    requireIdentity(db, config.sessionSecret),
    requireAdmin,
    async (req, res) => {
      const id = input.uuid.parse(req.params.id);
      const data = input.memberPasswordReset.parse(req.body);
      await consumeAuthLimit(
        db,
        config.sessionSecret,
        `member-reset-admin:${currentUser(req).id}`,
        10,
      );
      await service.resetMemberPassword(id, data.password);
      res.status(204).end();
    },
  );
  router.get('/me', requireIdentity(db, config.sessionSecret), (req, res) =>
    res.json({ user: currentUser(req) }),
  );
  router.post(
    '/logout',
    requireIdentity(db, config.sessionSecret),
    async (req, res) => {
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
    },
  );
  return router;
}
