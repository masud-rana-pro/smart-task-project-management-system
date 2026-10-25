import { z } from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  HOST: z.string().min(1).default('127.0.0.1'),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
});

export function parseEnvironment(input: NodeJS.ProcessEnv) {
  const result = environmentSchema.safeParse(input);
  if (!result.success) {
    // Report names, never environment values that may contain credentials.
    throw new Error(
      `Invalid environment fields: ${result.error.issues.map((issue) => issue.path.join('.')).join(', ')}`,
    );
  }
  return result.data;
}

export function parseApplicationEnvironment(input: NodeJS.ProcessEnv) {
  const base = parseEnvironment(input);
  const result = z
    .object({
      DATABASE_URL: z.string().url(),
      SESSION_SECRET: z
        .string()
        .min(64)
        .refine(
          (value) => !value.startsWith('REPLACE'),
          'Generate a unique session secret.',
        ),
      APP_ORIGIN: z.string().url().default('http://127.0.0.1:5173'),
      TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(1).default(0),
    })
    .safeParse(input);
  if (!result.success)
    throw new Error(
      `Invalid application environment fields: ${result.error.issues.map((issue) => issue.path.join('.')).join(', ')}`,
    );
  const origin = new URL(result.data.APP_ORIGIN);
  if (
    origin.origin !== result.data.APP_ORIGIN ||
    (base.NODE_ENV === 'production' && origin.protocol !== 'https:')
  )
    throw new Error(
      'APP_ORIGIN must be an origin without a path and use HTTPS in production.',
    );
  return { ...base, ...result.data };
}
