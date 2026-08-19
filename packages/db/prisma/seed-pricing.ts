// Phase 06.2 Plan 02 (D-04/D-05): reseeds the real PricingPlan table with the
// design file's Старт/Клініка/Мережа sales copy. Idempotent, re-runnable.
// This script never wipes or bulk-clears rows — matched by `name` (no
// @unique on `name` exists; adding one is a schema change outside D-04's
// scope), so each entry is upserted individually via findFirst -> update/create.
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type PlanSeed = {
  name: string;
  monthlyPrice: string;
  yearlyPrice: string;
  description: string;
  features: string[];
  isPopular: boolean;
  sortOrder: number;
  published: boolean;
};

const PLANS: PlanSeed[] = [
  {
    name: 'Старт',
    monthlyPrice: '890',
    yearlyPrice: '712',
    description: 'Кабінет або один лікар',
    features: [
      'Telegram-бот із записом',
      'Розклад одного лікаря',
      'Автонагадування',
      'Базова аналітика',
    ],
    isPopular: false,
    sortOrder: 0,
    published: true,
  },
  {
    name: 'Клініка',
    monthlyPrice: '1890',
    yearlyPrice: '1510',
    description: '2–8 лікарів, кілька кабінетів',
    features: [
      'Усе з тарифу «Старт»',
      'Спільний розклад усіх лікарів',
      'Доступ за ролями',
      'Аналітика по джерелах запису',
      'Відгуки після візиту',
      'Viber і WhatsApp',
    ],
    isPopular: true,
    sortOrder: 1,
    published: true,
  },
  {
    name: 'Мережа',
    monthlyPrice: '3900',
    yearlyPrice: '3120',
    description: 'Кілька філій під одним брендом',
    features: [
      'Усе з тарифу «Клініка»',
      'Кілька філій в одній панелі',
      'Зведені звіти по мережі',
      'API та інтеграції',
      'Персональний менеджер',
    ],
    isPopular: false,
    sortOrder: 2,
    published: true,
  },
];

async function main() {
  for (const plan of PLANS) {
    const existing = await prisma.pricingPlan.findFirst({
      where: { name: plan.name },
    });

    if (existing) {
      await prisma.pricingPlan.update({
        where: { id: existing.id },
        data: plan,
      });
    } else {
      await prisma.pricingPlan.create({ data: plan });
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
