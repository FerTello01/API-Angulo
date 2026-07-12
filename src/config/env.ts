import 'dotenv/config';
import { z } from 'zod';
import { EAS_PREDEPLOY } from '../chains/base.js';
import type { BaseNetwork } from '../chains/base.js';

const hexAddress = z.string().regex(/^0x[a-fA-F0-9]{40}$/);
const hexBytes32 = z.string().regex(/^0x[a-fA-F0-9]{64}$/);
const hexPrivateKey = z.string().regex(/^0x[a-fA-F0-9]{64}$/);

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  BASE_NETWORK: z.enum(['mainnet', 'sepolia']).default('sepolia'),
  BASE_RPC_URL: z.string().url().optional(),

  RELAYER_PRIVATE_KEY: hexPrivateKey,

  EAS_CONTRACT_ADDRESS: hexAddress.default(EAS_PREDEPLOY.eas),
  EAS_SCHEMA_REGISTRY_ADDRESS: hexAddress.default(EAS_PREDEPLOY.schemaRegistry),
  EAS_IMPACT_SCHEMA_UID: hexBytes32.optional(),

  EVVM_CORE_ADDRESS: hexAddress.optional(),
  EVVM_STAKING_ADDRESS: hexAddress.optional(),
  EVVM_ID: z.coerce.number().int().nonnegative().default(0),

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
export const baseNetwork = env.BASE_NETWORK as BaseNetwork;
