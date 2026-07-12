import 'dotenv/config';
import { z } from 'zod';
import type { GravityNetwork } from '../chains/gravity.js';

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  GRAVITY_NETWORK: z.enum(['mainnet', 'alpha', 'sepolia']).default('mainnet'),
  GRAVITY_RPC_URL: z.string().url().optional(),

  RELAYER_PRIVATE_KEY: z
    .string()
    .regex(/^0x[a-fA-F0-9]{64}$/, 'RELAYER_PRIVATE_KEY must be a 32-byte hex private key'),

  IMPACT_REGISTRY_CONTRACT_ADDRESS: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'IMPACT_REGISTRY_CONTRACT_ADDRESS must be a valid address'),

  TX_CONFIRMATIONS: z.coerce.number().int().min(1).default(1),
  TX_TIMEOUT_MS: z.coerce.number().int().min(5_000).default(120_000),
  TX_MAX_RETRIES: z.coerce.number().int().min(0).max(10).default(3),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const formatted = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${formatted}`);
  }

  return parsed.data;
}

export const env = loadEnv();
export const gravityNetwork = env.GRAVITY_NETWORK as GravityNetwork;
