import { createHash, randomBytes } from 'node:crypto';
import type { IssueCertificateInput } from '../schemas/certificate.schema.js';

export interface IpfsUploadResult {
  cid: string;
  uri: string;
  sizeBytes: number;
}

/**
 * Simulates uploading impact evidence and metadata to IPFS.
 * Replace this mock with Pinata, NFT.Storage, or an internal IPFS gateway in production.
 */
export async function uploadEvidenceToIpfs(
  payload: IssueCertificateInput,
): Promise<IpfsUploadResult> {
  const document = {
    version: '1.0',
    type: 'impact-certification-evidence',
    uploadedAt: new Date().toISOString(),
    companyTaxId: payload.companyTaxId,
    impactCategory: payload.impactCategory,
    amount: payload.amount,
    evidence: payload.evidence ?? null,
    metadata: payload.metadata ?? {},
  };

  const serialized = JSON.stringify(document);
  const digest = createHash('sha256').update(serialized).digest();

  // Produce a deterministic-looking CID mock (not a real multihash).
  const mockCid = `bafybeig${digest.toString('hex').slice(0, 52)}${randomBytes(4).toString('hex')}`;

  // Simulate network latency of an IPFS pinning service.
  await new Promise((resolve) => setTimeout(resolve, 50));

  return {
    cid: mockCid,
    uri: `ipfs://${mockCid}`,
    sizeBytes: Buffer.byteLength(serialized, 'utf8'),
  };
}
