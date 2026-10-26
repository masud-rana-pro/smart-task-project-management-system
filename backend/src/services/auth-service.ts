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
        passwordHash: user.passwordHash,
      };
    },
    async listMembers() {
      return {
        users: await db.user.findMany({
          where: { role: 'TEAM_MEMBER' },
          select: { id: true, name: true, email: true },
          orderBy: [{ name: 'asc' }, { id: 'asc' }],
        }),
      };
    },
    async resetMemberPassword(id: string, password: string) {
      const target = await db.user.findUnique({
        where: { id },
        select: { role: true },
      });
      if (target?.role !== 'TEAM_MEMBER')
        throw new ApiError(
          404,
          'MEMBER_NOT_FOUND',
          'Select an existing Team Member.',
        );
      const passwordHash = await hashPassword(password);
      await db.$transaction(async (tx) => {
        const changed = await tx.user.updateMany({
          where: { id, role: 'TEAM_MEMBER' },
          data: { passwordHash },
        });
        if (changed.count !== 1)
          throw new ApiError(
            404,
            'MEMBER_NOT_FOUND',
            'Select an existing Team Member.',
          );
        await tx.$executeRaw`DELETE FROM sessions WHERE sess->>'userId' = ${id}`;
      });
    },
    async cleanupExpiredState() {
      await db.$executeRaw`DELETE FROM sessions WHERE expire < now()`;
      await db.authRateLimit.deleteMany({
        where: { expiresAt: { lt: new Date() } },
      });
    },
  };
}
