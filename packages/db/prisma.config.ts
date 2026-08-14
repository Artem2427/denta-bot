import { config } from 'dotenv';
import path from 'node:path';
import { env, type PrismaConfig } from 'prisma/config';

// Prisma CLI commands invoked from `packages/db` (via `pnpm --filter @repo/db run db:*`)
// have a cwd of `packages/db`, but the root `.env` lives two levels up — load it
// explicitly so `DATABASE_URL` resolves regardless of invocation cwd.
config({ path: path.resolve(__dirname, '../../.env') });

export default {
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    path: path.join('prisma', 'migrations'),
  },
  // Prisma 7 no longer reads `url` from the `datasource` block in schema.prisma
  // for migrate/introspect commands — it must be supplied here instead.
  datasource: {
    url: env('DATABASE_URL'),
  },
} satisfies PrismaConfig;
