import {
  createPublicClient,
  createWalletClient,
  http,
  type Account,
  type Chain,
  type PublicClient,
  type WalletClient,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { defaultRpcUrl, resolveGravityChain } from '../chains/gravity.js';
import { env, gravityNetwork } from '../config/env.js';

export interface GravityClients {
  chain: Chain;
  account: Account;
  publicClient: PublicClient;
  walletClient: WalletClient;
}

let cachedClients: GravityClients | null = null;

/**
 * Builds (or returns cached) viem clients wired to the Gravity network.
 * The operational relayer account signs all on-chain transactions.
 */
export function getGravityClients(): GravityClients {
  if (cachedClients) return cachedClients;

  const chain = resolveGravityChain(gravityNetwork);
  const rpcUrl = env.GRAVITY_RPC_URL ?? defaultRpcUrl(gravityNetwork);
  const transport = http(rpcUrl, { timeout: env.TX_TIMEOUT_MS });

  const account = privateKeyToAccount(env.RELAYER_PRIVATE_KEY as `0x${string}`);

  const publicClient = createPublicClient({ chain, transport });
  const walletClient = createWalletClient({ chain, transport, account });

  cachedClients = { chain, account, publicClient, walletClient };
  return cachedClients;
}

/** Resets the client cache — useful in tests or after config hot-reload. */
export function resetGravityClients(): void {
  cachedClients = null;
}
