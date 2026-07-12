import { randomUUID } from 'node:crypto';
import type { IssueCertificateInput } from '../schemas/certificate.schema.js';
import type {
  CertificateRecord,
  IssueCertificateResponse,
} from '../types/certificate.types.js';
import { computeCertificateHash } from '../web3/impactAttestation.worker.js';
import { sendImpactAttestationOnchain } from '../web3/impactAttestation.worker.js';
import { uploadEvidenceToIpfs } from './ipfs.service.js';

/**
 * In-memory certificate store.
 * Replace with PostgreSQL / Redis in production for durability and horizontal scaling.
 */
const certificateStore = new Map<string, CertificateRecord>();

export function getCertificateById(id: string): CertificateRecord | undefined {
  return certificateStore.get(id);
}

export function listCertificates(): CertificateRecord[] {
  return [...certificateStore.values()];
}

/**
 * Issues a new impact certificate:
 *  1. Uploads evidence to IPFS (mocked).
 *  2. Returns an immediate PROCESSING response.
 *  3. Dispatches the on-chain attestation asynchronously via the relayer.
 */
export async function issueCertificate(
  input: IssueCertificateInput,
): Promise<IssueCertificateResponse> {
  const certificateId = randomUUID();
  const nonce = randomUUID();
  const now = new Date().toISOString();

  const ipfsResult = await uploadEvidenceToIpfs(input);
  const amountString =
    typeof input.amount === 'number' ? input.amount.toString() : input.amount;

  const certificateHash = computeCertificateHash({
    companyTaxId: input.companyTaxId,
    impactCategory: input.impactCategory,
    amount: amountString,
    ipfsHash: ipfsResult.cid,
    nonce,
  });

  const record: CertificateRecord = {
    id: certificateId,
    certificateHash,
    companyTaxId: input.companyTaxId,
    impactCategory: input.impactCategory,
    amount: amountString,
    ipfsCid: ipfsResult.cid,
    status: 'PROCESSING',
    createdAt: now,
    updatedAt: now,
  };

  certificateStore.set(certificateId, record);

  // Fire-and-forget: relayer covers gas; client receives immediate HTTP 202-style confirmation.
  void processOnchainAttestation(certificateId, input, ipfsResult.cid, nonce);

  return {
    certificateId,
    certificateHash,
    status: 'PROCESSING',
    ipfsCid: ipfsResult.cid,
    message:
      'Certificate issuance accepted. On-chain attestation is being processed by the relayer.',
  };
}

async function processOnchainAttestation(
  certificateId: string,
  input: IssueCertificateInput,
  ipfsCid: string,
  nonce: string,
): Promise<void> {
  const record = certificateStore.get(certificateId);
  if (!record) return;

  try {
    const result = await sendImpactAttestationOnchain(
      input.companyTaxId,
      input.impactCategory,
      input.amount,
      ipfsCid,
      nonce,
    );

    record.status = 'CONFIRMED';
    record.attestationUID = result.attestationUID;
    record.txHash = result.txHash;
    record.blockNumber = result.blockNumber;
    record.updatedAt = new Date().toISOString();
    record.certificateHash = result.certificateHash;

    console.info('[certificate-service] EAS attestation confirmed', {
      certificateId,
      attestationUID: result.attestationUID,
      txHash: result.txHash,
    });
  } catch (error) {
    record.status = 'FAILED';
    record.errorMessage =
      error instanceof Error ? error.message : 'Unknown attestation error';
    record.updatedAt = new Date().toISOString();

    console.error('[certificate-service] On-chain attestation failed', {
      certificateId,
      error: record.errorMessage,
    });
  }

  certificateStore.set(certificateId, record);
}
