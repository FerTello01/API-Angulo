import { base, baseSepolia } from 'viem/chains';

export type BaseNetwork = 'mainnet' | 'sepolia';

/**
 * EAS predeploy addresses on OP Stack chains (Base / Base Sepolia).
 * @see https://docs.optimism.io/op-stack/protocol/smart-contracts
 */
export const EAS_PREDEPLOY = {
  eas: '0x4200000000000000000000000000000000000021' as const,
  schemaRegistry: '0x4200000000000000000000000000000000000020' as const,
} as const;

/** Impact certification schema definition for EAS registration. */
export const IMPACT_SCHEMA_DEFINITION =
  'string companyTaxId,string impactCategory,uint256 amount,string ipfsEvidence';

export function resolveBaseChain(network: BaseNetwork) {
  return network === 'mainnet' ? base : baseSepolia;
}

export function defaultRpcUrl(network: BaseNetwork): string {
  return network === 'mainnet'
    ? 'https://mainnet.base.org'
    : 'https://sepolia.base.org';
}

export function explorerUrl(network: BaseNetwork): string {
  return network === 'mainnet'
    ? 'https://basescan.org'
    : 'https://sepolia.basescan.org';
}
