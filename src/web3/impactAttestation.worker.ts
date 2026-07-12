import { randomBytes } from 'node:crypto';
import {
  BaseError,
  ContractFunctionRevertedError,
  EstimateGasExecutionError,
  InsufficientFundsError,
  TimeoutError,
  encodePacked,
  keccak256,
  parseUnits,
} from 'viem';
import { impactCertificateRegistryAbi } from '../abi/ImpactCertificateRegistry.js';
import { env } from '../config/env.js';
import type { ImpactAttestationResult } from '../types/certificate.types.js';
import { Web3WorkerError } from '../types/certificate.types.js';
import { getGravityClients } from './client.js';

const LOG_PREFIX = '[web3:impact-attestation]';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Derives a deterministic certificate hash from attestation inputs.
 * Includes a nonce to guarantee uniqueness per issuance request.
 */
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

function normalizeAmount(amount: number | string): bigint {
  const value = typeof amount === 'number' ? amount.toString() : amount;
  return parseUnits(value, 0);
}

function classifyError(error: unknown): Web3WorkerError {
  if (error instanceof Web3WorkerError) return error;

  if (error instanceof TimeoutError) {
    return new Web3WorkerError(
      `Gravity network timeout after ${env.TX_TIMEOUT_MS}ms`,
      'TX_TIMEOUT',
      error,
    );
  }

  if (error instanceof InsufficientFundsError) {
    return new Web3WorkerError(
      'Relayer wallet has insufficient G tokens for gas',
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
      'Gas estimation failed — contract may reject this attestation',
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

/**
 * Sends an impact attestation on-chain via the operational relayer wallet.
 *
 * @param taxId      Corporate tax identifier (RFC).
 * @param category   Impact category label.
 * @param amount     Quantified impact (integer base units).
 * @param ipfsHash   IPFS CID referencing evidence metadata.
 * @param nonce      Optional uniqueness salt (auto-generated if omitted).
 */
export async function sendImpactAttestationOnchain(
  taxId: string,
  category: string,
  amount: number | string,
  ipfsHash: string,
  nonce?: string,
): Promise<ImpactAttestationResult> {
  const { publicClient, walletClient, account, chain } = getGravityClients();
  const contractAddress = env.IMPACT_REGISTRY_CONTRACT_ADDRESS as `0x${string}`;
  const attestationNonce = nonce ?? randomBytes(16).toString('hex');
  const normalizedAmount = normalizeAmount(amount);

  const certificateHash = computeCertificateHash({
    companyTaxId: taxId,
    impactCategory: category,
    amount: normalizedAmount.toString(),
    ipfsHash,
    nonce: attestationNonce,
  });

  console.info(`${LOG_PREFIX} Submitting attestation`, {
    chainId: chain.id,
    certificateHash,
    taxId,
    category,
    relayer: account.address,
  });

  let lastError: Web3WorkerError | undefined;

  for (let attempt = 1; attempt <= env.TX_MAX_RETRIES + 1; attempt++) {
    try {
      const { request } = await publicClient.simulateContract({
        account,
        address: contractAddress,
        abi: impactCertificateRegistryAbi,
        functionName: 'emitCertificate',
        args: [certificateHash, taxId, category, normalizedAmount, ipfsHash],
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

      console.info(`${LOG_PREFIX} Attestation confirmed`, {
        txHash,
        blockNumber: receipt.blockNumber.toString(),
        certificateHash,
      });

      return {
        certificateHash,
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

  throw lastError ?? new Web3WorkerError('Attestation failed', 'UNKNOWN');
}
