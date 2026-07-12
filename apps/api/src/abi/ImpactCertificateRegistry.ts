/**
 * ABI generated from contracts/ImpactCertificateRegistry.sol
 * Keep in sync when the contract interface changes.
 */
export const impactCertificateRegistryAbi = [
  {
    type: 'constructor',
    inputs: [{ name: '_relayer', type: 'address', internalType: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'emitCertificate',
    inputs: [
      { name: 'certificateHash', type: 'bytes32', internalType: 'bytes32' },
      { name: 'companyTaxId', type: 'string', internalType: 'string' },
      { name: 'impactCategory', type: 'string', internalType: 'string' },
      { name: 'amount', type: 'uint256', internalType: 'uint256' },
      { name: 'ipfsEvidence', type: 'string', internalType: 'string' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getCertificate',
    inputs: [{ name: 'certificateHash', type: 'bytes32', internalType: 'bytes32' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct ImpactCertificateRegistry.Certificate',
        components: [
          { name: 'companyTaxId', type: 'string', internalType: 'string' },
          { name: 'impactCategory', type: 'string', internalType: 'string' },
          { name: 'amount', type: 'uint256', internalType: 'uint256' },
          { name: 'ipfsEvidence', type: 'string', internalType: 'string' },
          { name: 'timestamp', type: 'uint256', internalType: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'certificateExists',
    inputs: [{ name: '', type: 'bytes32', internalType: 'bytes32' }],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'relayer',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'owner',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'CertificateEmitted',
    inputs: [
      { name: 'certificateHash', type: 'bytes32', indexed: true, internalType: 'bytes32' },
      { name: 'companyTaxId', type: 'string', indexed: true, internalType: 'string' },
      { name: 'impactCategory', type: 'string', indexed: false, internalType: 'string' },
      { name: 'amount', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'ipfsEvidence', type: 'string', indexed: false, internalType: 'string' },
      { name: 'timestamp', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'Unauthorized',
    inputs: [],
  },
  {
    type: 'error',
    name: 'CertificateAlreadyExists',
    inputs: [{ name: 'certificateHash', type: 'bytes32', internalType: 'bytes32' }],
  },
  {
    type: 'error',
    name: 'CertificateNotFound',
    inputs: [{ name: 'certificateHash', type: 'bytes32', internalType: 'bytes32' }],
  },
  {
    type: 'error',
    name: 'InvalidInput',
    inputs: [{ name: 'field', type: 'string', internalType: 'string' }],
  },
] as const;
