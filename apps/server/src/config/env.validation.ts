import { z } from 'zod';

export const envSchema = z
  .object({
    DATABASE_URL: z.string().min(1),
    PORT: z.coerce.number().default(4000),
    JWT_ACCESS_SECRET: z.string().min(16),
    JWT_REFRESH_SECRET: z.string().min(16),
    PLATFORM_ADMIN_EMAIL: z.string(),
    PLATFORM_ADMIN_PASSWORD: z.string(),
    CORS_ALLOWED_ORIGINS: z.string().min(1),
    REFRESH_COOKIE_DOMAIN: z.string().optional(),
    REFRESH_COOKIE_SAMESITE: z
      .enum(['strict', 'lax', 'none'])
      .default('strict'),
  })
  .refine((data) => data.JWT_ACCESS_SECRET !== data.JWT_REFRESH_SECRET, {
    message: 'JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be distinct',
    path: ['JWT_REFRESH_SECRET'],
  });

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    throw new Error(
      `Invalid environment configuration: ${parsed.error.message}`,
    );
  }
  return parsed.data;
}
