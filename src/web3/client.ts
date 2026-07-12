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
import { defaultRpcUrl, resolveBaseChain } from '../chains/base.js';
import { env, baseNetwork } from '../config/env.js';

export interface ChainClients {
  chain: Chain;
  account: Account;
  publicClient: PublicClient;
  walletClient: WalletClient;
}

let cachedClients: ChainClients | null = null;

/**
 * Builds (or returns cached) viem clients wired to Base.
 * The operational relayer account signs all on-chain transactions.
 */
export function getChainClients(): ChainClients {
  if (cachedClients) return cachedClients;

  const chain = resolveBaseChain(baseNetwork);
  const rpcUrl = env.BASE_RPC_URL ?? defaultRpcUrl(baseNetwork);
  const transport = http(rpcUrl, { timeout: env.TX_TIMEOUT_MS });

  const account = privateKeyToAccount(env.RELAYER_PRIVATE_KEY as `0x${string}`);

  const publicClient = createPublicClient({ chain, transport });
  const walletClient = createWalletClient({ chain, transport, account });

  cachedClients = {
    chain,
    account,
    publicClient,
    walletClient,
  } as ChainClients;

  return cachedClients;
}

/** Resets the client cache — useful in tests or after config hot-reload. */
export function resetChainClients(): void {
  cachedClients = null;
}
