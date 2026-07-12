/**
 * Registers the Impact Certification schema on Base via EAS SchemaRegistry.
 *
 * Usage:
 *   npm run register-schema
 *
 * After running, copy the printed schema UID into .env as EAS_IMPACT_SCHEMA_UID.
 */
import 'dotenv/config';
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { schemaRegistryAbi } from '../src/abi/eas.js';
import {
  EAS_PREDEPLOY,
  IMPACT_SCHEMA_DEFINITION,
  defaultRpcUrl,
  explorerUrl,
  resolveBaseChain,
} from '../src/chains/base.js';

const network = (process.env.BASE_NETWORK ?? 'sepolia') as 'mainnet' | 'sepolia';
const privateKey = process.env.RELAYER_PRIVATE_KEY;

if (!privateKey?.match(/^0x[a-fA-F0-9]{64}$/)) {
  console.error('ERROR: Set RELAYER_PRIVATE_KEY in .env before running this script.');
  process.exit(1);
}

const chain = resolveBaseChain(network);
const rpcUrl = process.env.BASE_RPC_URL ?? defaultRpcUrl(network);
const transport = http(rpcUrl);
const account = privateKeyToAccount(privateKey as `0x${string}`);

const publicClient = createPublicClient({ chain, transport });
const walletClient = createWalletClient({ chain, transport, account });

const registryAddress = (process.env.EAS_SCHEMA_REGISTRY_ADDRESS ??
  EAS_PREDEPLOY.schemaRegistry) as `0x${string}`;

async function main() {
  console.log('Registering EAS Impact Certification schema on Base...\n');
  console.log(`  Network:    ${network} (chain ${chain.id})`);
  console.log(`  Registry:   ${registryAddress}`);
  console.log(`  Schema:     ${IMPACT_SCHEMA_DEFINITION}`);
  console.log(`  Registerer: ${account.address}\n`);

  const { result: schemaUID, request } = await publicClient.simulateContract({
    account,
    address: registryAddress,
    abi: schemaRegistryAbi,
    functionName: 'register',
    args: [IMPACT_SCHEMA_DEFINITION, '0x0000000000000000000000000000000000000000', true],
  });

  const txHash = await walletClient.writeContract(request);
  console.log(`  Tx hash:    ${txHash}`);

  await publicClient.waitForTransactionReceipt({ hash: txHash });

  const explorer = explorerUrl(network);
  const easScan = network === 'mainnet' ? 'base.easscan.org' : 'base-sepolia.easscan.org';

  console.log('\n✓ Schema registered successfully!\n');
  console.log('Add this to your .env:\n');
  console.log(`EAS_IMPACT_SCHEMA_UID=${schemaUID}`);
  console.log(`\nVerify tx:  ${explorer}/tx/${txHash}`);
  console.log(`EAS Scan:   https://${easScan}`);
}

main().catch((err) => {
  console.error('Schema registration failed:', err);
  process.exit(1);
});
