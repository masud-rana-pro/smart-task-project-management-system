import type { z } from 'zod';
import type { Database } from '../db.js';
import type * as input from '../validation.js';
import { ApiError } from '../errors.js';
import { hashPassword, verifyPassword } from '../passwords.js';
import { identitySelect } from '../security.js';

export function createAuthService(db: Database) {
  return {
    async register(data: z.output<typeof input.registration>) {
      return db.user.create({
        data: {
          name: data.name,
          email: data.email,
          passwordHash: await hashPassword(data.password),
          role: 'TEAM_MEMBER',
        },
        select: identitySelect,
      });
    },
    async authenticate(data: z.output<typeof input.login>) {
      const user = await db.user.findUnique({ where: { email: data.email } });
      if (!(await verifyPassword(data.password, user?.passwordHash)) || !user)
        throw new ApiError(
          401,
          'INVALID_CREDENTIALS',
          'Email or password is incorrect.',
        );
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };
    },
    async cleanupExpiredState() {
      await db.$executeRaw`DELETE FROM sessions WHERE expire < now()`;
      await db.authRateLimit.deleteMany({
        where: { expiresAt: { lt: new Date() } },
      });
    },
  };
}
