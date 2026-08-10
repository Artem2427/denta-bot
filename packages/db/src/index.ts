// @repo/db barrel — the only import surface consumers (apps/server) use.
// Prisma 7's `prisma-client` generator emits `client.ts` (not `index.ts`) as its
// documented main entry point ("You can import this file directly.").
export * from '../generated/prisma/client';
