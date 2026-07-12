export type CertificateStatus = 'PROCESSING' | 'CONFIRMED' | 'FAILED';

export interface CertificateRecord {
  id: string;
  certificateHash: `0x${string}`;
  companyTaxId: string;
  impactCategory: string;
  amount: string;
  ipfsCid: string;
  status: CertificateStatus;
  txHash?: `0x${string}`;
  blockNumber?: bigint;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IssueCertificateResponse {
  certificateId: string;
  certificateHash: `0x${string}`;
  status: 'PROCESSING';
  ipfsCid: string;
  message: string;
}

export interface ImpactAttestationResult {
  certificateHash: `0x${string}`;
  txHash: `0x${string}`;
  blockNumber: bigint;
}

export class Web3WorkerError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'CONFIG_ERROR'
      | 'GAS_ESTIMATION_FAILED'
      | 'INSUFFICIENT_FUNDS'
      | 'TX_REVERTED'
      | 'TX_TIMEOUT'
      | 'NETWORK_ERROR'
      | 'CONTRACT_ERROR'
      | 'UNKNOWN',
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'Web3WorkerError';
  }
}
