import { randomBytes } from 'node:crypto';
import {
  BaseError,
  ContractFunctionRevertedError,
  EstimateGasExecutionError,
  InsufficientFundsError,
  TimeoutError,
  encodeAbiParameters,
  encodePacked,
  keccak256,
  parseAbiParameters,
  parseUnits,
} from 'viem';
import { easAbi } from '../abi/eas.js';
import { IMPACT_SCHEMA_DEFINITION } from '../chains/base.js';
import { env } from '../config/env.js';
import type { ImpactAttestationResult } from '../types/certificate.types.js';
import { Web3WorkerError } from '../types/certificate.types.js';
import { getChainClients } from './client.js';

const LOG_PREFIX = '[web3:eas-attestation]';
const ZERO_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000' as const;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function computeCertificateHash(params: {
  companyTaxId: string;
  impactCategory: string;
  amount: string;
  ipfsHash: string;
  nonce: string;
}): `0x${string}` {
  return keccak256(
    encodePacked(
      ['string', 'string', 'string', 'string', 'string'],
      [
        params.companyTaxId,
        params.impactCategory,
        params.amount,
        params.ipfsHash,
        params.nonce,
      ],
    ),
  );
}

export function encodeImpactSchemaData(
  taxId: string,
  category: string,
  amount: bigint,
  ipfsHash: string,
): `0x${string}` {
  return encodeAbiParameters(
    parseAbiParameters('string, string, uint256, string'),
    [taxId, category, amount, ipfsHash],
  );
}

function normalizeAmount(amount: number | string): bigint {
  const value = typeof amount === 'number' ? amount.toString() : amount;
  return parseUnits(value, 0);
}

function classifyError(error: unknown): Web3WorkerError {
  if (error instanceof Web3WorkerError) return error;

  if (error instanceof TimeoutError) {
    return new Web3WorkerError(
      `Base network timeout after ${env.TX_TIMEOUT_MS}ms`,
      'TX_TIMEOUT',
      error,
    );
  }

  if (error instanceof InsufficientFundsError) {
    return new Web3WorkerError(
      'Relayer wallet has insufficient ETH on Base for gas',
      'INSUFFICIENT_FUNDS',
      error,
    );
  }

  if (error instanceof EstimateGasExecutionError) {
    const revert = error.walk((e) => e instanceof ContractFunctionRevertedError);
    if (revert instanceof ContractFunctionRevertedError) {
      return new Web3WorkerError(
        `Gas estimation reverted: ${revert.reason ?? 'unknown'}`,
        'GAS_ESTIMATION_FAILED',
        error,
      );
    }
    return new Web3WorkerError(
      'Gas estimation failed — EAS may reject this attestation',
      'GAS_ESTIMATION_FAILED',
      error,
    );
  }

  if (error instanceof BaseError) {
    const revert = error.walk((e) => e instanceof ContractFunctionRevertedError);
    if (revert instanceof ContractFunctionRevertedError) {
      return new Web3WorkerError(
        `Transaction reverted: ${revert.reason ?? 'unknown'}`,
        'TX_REVERTED',
        error,
      );
    }

    const message = error.shortMessage ?? error.message;
    if (/timeout|timed out|ETIMEDOUT|ECONNRESET|ENOTFOUND/i.test(message)) {
      return new Web3WorkerError(message, 'NETWORK_ERROR', error);
    }
  }

  const message = error instanceof Error ? error.message : 'Unknown Web3 error';
  return new Web3WorkerError(message, 'UNKNOWN', error);
}

function assertSchemaConfigured(): `0x${string}` {
  if (!env.EAS_IMPACT_SCHEMA_UID) {
    throw new Web3WorkerError(
      'EAS_IMPACT_SCHEMA_UID is not configured. Run: npm run register-schema',
      'CONFIG_ERROR',
    );
  }
  return env.EAS_IMPACT_SCHEMA_UID as `0x${string}`;
}

/**
 * Emits an EAS on-chain attestation for corporate impact on Base.
 * Uses the predeployed EAS contract (OP Stack) and the registered Impact schema.
 */
export async function sendImpactAttestationOnchain(
  taxId: string,
  category: string,
  amount: number | string,
  ipfsHash: string,
  nonce?: string,
): Promise<ImpactAttestationResult> {
  const schemaUID = assertSchemaConfigured();
  const { publicClient, walletClient, account, chain } = getChainClients();
  const easAddress = env.EAS_CONTRACT_ADDRESS as `0x${string}`;

  const attestationNonce = nonce ?? randomBytes(16).toString('hex');
  const normalizedAmount = normalizeAmount(amount);
  const encodedData = encodeImpactSchemaData(taxId, category, normalizedAmount, ipfsHash);

  const certificateHash = computeCertificateHash({
    companyTaxId: taxId,
    impactCategory: category,
    amount: normalizedAmount.toString(),
    ipfsHash,
    nonce: attestationNonce,
  });

  console.info(`${LOG_PREFIX} Submitting EAS attestation`, {
    chainId: chain.id,
    network: env.BASE_NETWORK,
    schema: schemaUID,
    certificateHash,
    taxId,
    category,
    schemaDefinition: IMPACT_SCHEMA_DEFINITION,
    attester: account.address,
  });

  let lastError: Web3WorkerError | undefined;

  for (let attempt = 1; attempt <= env.TX_MAX_RETRIES + 1; attempt++) {
    try {
      const { result: attestationUID, request } = await publicClient.simulateContract({
        account,
        address: easAddress,
        abi: easAbi,
        functionName: 'attest',
        args: [
          {
            schema: schemaUID,
            data: {
              recipient: '0x0000000000000000000000000000000000000000',
              expirationTime: 0n,
              revocable: true,
              refUID: ZERO_BYTES32,
              data: encodedData,
              value: 0n,
            },
          },
        ],
      });

      const txHash = await walletClient.writeContract(request);

      console.info(`${LOG_PREFIX} Transaction broadcast`, { txHash, attempt });

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
        confirmations: env.TX_CONFIRMATIONS,
        timeout: env.TX_TIMEOUT_MS,
      });

      if (receipt.status === 'reverted') {
        throw new Web3WorkerError(
          `Transaction ${txHash} reverted on-chain`,
          'TX_REVERTED',
        );
      }

      console.info(`${LOG_PREFIX} EAS attestation confirmed`, {
        txHash,
        attestationUID,
        blockNumber: receipt.blockNumber.toString(),
        certificateHash,
      });

      return {
        certificateHash,
        attestationUID: attestationUID as `0x${string}`,
        txHash,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      lastError = classifyError(error);

      console.error(`${LOG_PREFIX} Attempt ${attempt} failed`, {
        code: lastError.code,
        message: lastError.message,
      });

      const isRetryable =
        lastError.code === 'NETWORK_ERROR' ||
        lastError.code === 'TX_TIMEOUT' ||
        lastError.code === 'UNKNOWN';

      if (!isRetryable || attempt > env.TX_MAX_RETRIES) break;

      const backoffMs = Math.min(1_000 * 2 ** (attempt - 1), 10_000);
      console.warn(`${LOG_PREFIX} Retrying in ${backoffMs}ms…`);
      await sleep(backoffMs);
    }
  }

  throw lastError ?? new Web3WorkerError('EAS attestation failed', 'UNKNOWN');
}
