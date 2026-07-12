/**
 * Validates deployment readiness for Base + EVVM + EAS.
 */
import 'dotenv/config';
import { createPublicClient, formatEther, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { schemaRegistryAbi } from '../src/abi/eas.js';
import {
  EAS_PREDEPLOY,
  defaultRpcUrl,
  explorerUrl,
  resolveBaseChain,
} from '../src/chains/base.js';

const network = (process.env.BASE_NETWORK ?? 'sepolia') as 'mainnet' | 'sepolia';
const privateKey = process.env.RELAYER_PRIVATE_KEY;

interface Check {
  label: string;
  ok: boolean;
  detail: string;
}

const checks: Check[] = [];

function check(label: string, ok: boolean, detail: string) {
  checks.push({ label, ok, detail });
}

async function main() {
  console.log(`\n🔍 API Angulo — Deployment Check (Base ${network})\n`);

  const chain = resolveBaseChain(network);
  const rpcUrl = process.env.BASE_RPC_URL ?? defaultRpcUrl(network);

  check('BASE_NETWORK', !!network, `${network} (chain ${chain.id})`);
  check('BASE_RPC_URL', !!rpcUrl, rpcUrl);

  const hasKey = !!privateKey?.match(/^0x[a-fA-F0-9]{64}$/);
  check('RELAYER_PRIVATE_KEY', hasKey, hasKey ? 'configured' : 'missing or invalid');

  const easAddr = process.env.EAS_CONTRACT_ADDRESS ?? EAS_PREDEPLOY.eas;
  const registryAddr = process.env.EAS_SCHEMA_REGISTRY_ADDRESS ?? EAS_PREDEPLOY.schemaRegistry;
  check('EAS_CONTRACT_ADDRESS', true, easAddr);
  check('EAS_SCHEMA_REGISTRY_ADDRESS', true, registryAddr);

  const schemaUID = process.env.EAS_IMPACT_SCHEMA_UID;
  check(
    'EAS_IMPACT_SCHEMA_UID',
    !!schemaUID?.match(/^0x[a-fA-F0-9]{64}$/),
    schemaUID ?? 'not set — run: npm run register-schema',
  );

  const evvmCore = process.env.EVVM_CORE_ADDRESS;
  check(
    'EVVM_CORE_ADDRESS',
    !!evvmCore?.match(/^0x[a-fA-F0-9]{40}$/),
    evvmCore ?? 'not set — deploy EVVM first (see docs/DEPLOY-BASE.md)',
  );

  if (hasKey) {
    const publicClient = createPublicClient({ chain, transport: http(rpcUrl) });
    const account = privateKeyToAccount(privateKey as `0x${string}`);

    try {
      const balance = await publicClient.getBalance({ address: account.address });
      const eth = formatEther(balance);
      check(
        'Relayer balance',
        balance > 0n,
        `${eth} ETH — ${account.address}`,
      );
    } catch {
      check('Relayer balance', false, 'could not fetch balance');
    }

    try {
      const code = await publicClient.getBytecode({ address: easAddr as `0x${string}` });
      check('EAS contract deployed', !!code && code !== '0x', `bytecode at ${easAddr}`);
    } catch {
      check('EAS contract deployed', false, 'could not verify');
    }

    if (schemaUID?.match(/^0x[a-fA-F0-9]{64}$/)) {
      try {
        const schema = await publicClient.readContract({
          address: registryAddr as `0x${string}`,
          abi: schemaRegistryAbi,
          functionName: 'getSchema',
          args: [schemaUID as `0x${string}`],
        });
        check('Schema registered', schema[0].length > 0, schema[0]);
      } catch {
        check('Schema registered', false, 'schema UID not found on-chain');
      }
    }
  }

  console.log('─'.repeat(60));
  for (const c of checks) {
    console.log(`${c.ok ? '✅' : '❌'} ${c.label}`);
    console.log(`   ${c.detail}`);
  }
  console.log('─'.repeat(60));

  const failed = checks.filter((c) => !c.ok).length;
  console.log(`\n${failed === 0 ? '✅ All checks passed' : `⚠️  ${failed} check(s) need attention`}`);
  console.log(`Explorer: ${explorerUrl(network)}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
