import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client.js';

export function createDatabase(connectionString: string) {
  // One bounded pool shared by the ORM and session store per application instance.
  const pool = new pg.Pool({
    connectionString,
    max: 4,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30_000,
  });
  const db = new PrismaClient({ adapter: new PrismaPg(pool) });
  return {
    db,
    pool,
    async close() {
      await db.$disconnect();
      await pool.end();
    },
  };
}
export type Database = ReturnType<typeof createDatabase>['db'];
