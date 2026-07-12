/**
 * Minimal EAS ABI for on-chain attestations on Base (OP Stack predeploy).
 * @see https://github.com/ethereum-attestation-service/eas-contracts
 */
export const easAbi = [
  {
    type: 'function',
    name: 'attest',
    inputs: [
      {
        name: 'request',
        type: 'tuple',
        internalType: 'struct AttestationRequest',
        components: [
          { name: 'schema', type: 'bytes32', internalType: 'bytes32' },
          {
            name: 'data',
            type: 'tuple',
            internalType: 'struct AttestationRequestData',
            components: [
              { name: 'recipient', type: 'address', internalType: 'address' },
              { name: 'expirationTime', type: 'uint64', internalType: 'uint64' },
              { name: 'revocable', type: 'bool', internalType: 'bool' },
              { name: 'refUID', type: 'bytes32', internalType: 'bytes32' },
              { name: 'data', type: 'bytes', internalType: 'bytes' },
              { name: 'value', type: 'uint256', internalType: 'uint256' },
            ],
          },
        ],
      },
    ],
    outputs: [{ name: '', type: 'bytes32', internalType: 'bytes32' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'getAttestation',
    inputs: [{ name: 'uid', type: 'bytes32', internalType: 'bytes32' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct Attestation',
        components: [
          { name: 'uid', type: 'bytes32', internalType: 'bytes32' },
          { name: 'schema', type: 'bytes32', internalType: 'bytes32' },
          { name: 'time', type: 'uint64', internalType: 'uint64' },
          { name: 'expirationTime', type: 'uint64', internalType: 'uint64' },
          { name: 'revocationTime', type: 'uint64', internalType: 'uint64' },
          { name: 'refUID', type: 'bytes32', internalType: 'bytes32' },
          { name: 'recipient', type: 'address', internalType: 'address' },
          { name: 'attester', type: 'address', internalType: 'address' },
          { name: 'revocable', type: 'bool', internalType: 'bool' },
          { name: 'data', type: 'bytes', internalType: 'bytes' },
        ],
      },
    ],
    stateMutability: 'view',
  },
] as const;

export const schemaRegistryAbi = [
  {
    type: 'function',
    name: 'register',
    inputs: [
      { name: 'schema', type: 'string', internalType: 'string' },
      { name: 'resolver', type: 'address', internalType: 'address' },
      { name: 'revocable', type: 'bool', internalType: 'bool' },
    ],
    outputs: [{ name: '', type: 'bytes32', internalType: 'bytes32' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getSchema',
    inputs: [{ name: 'uid', type: 'bytes32', internalType: 'bytes32' }],
    outputs: [
      { name: 'schema', type: 'string', internalType: 'string' },
      { name: 'resolver', type: 'address', internalType: 'address' },
      { name: 'revocable', type: 'bool', internalType: 'bool' },
    ],
    stateMutability: 'view',
  },
] as const;
