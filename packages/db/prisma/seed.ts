// D-15: bootstraps the first PlatformAdmin from env vars. Re-runnable (upsert by email).
// Never deleteMany/truncate any table — this script only ever writes the single admin row.
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as argon2 from 'argon2';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.PLATFORM_ADMIN_EMAIL;
  const password = process.env.PLATFORM_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error(
      'PLATFORM_ADMIN_EMAIL and PLATFORM_ADMIN_PASSWORD must be set',
    );
  }

  const passwordHash = await argon2.hash(password); // argon2id by default

  await prisma.platformAdmin.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
