import { defineChain } from 'viem';
import { gravity } from 'viem/chains';

/**
 * Gravity Mainnet L1 — production chain (chain ID 127001).
 * @see https://docs.gravity.xyz/overview/readme
 */
export const gravityMainnet = defineChain({
  id: 127_001,
  name: 'Gravity Mainnet',
  nativeCurrency: {
    name: 'Gravity',
    symbol: 'G',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://mainnet-rpc.gravity.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Gravity Explorer',
      url: 'https://explorer.gravity.xyz',
    },
  },
});

/**
 * Gravity Alpha Sepolia Testnet (chain ID 13505).
 */
export const gravitySepolia = defineChain({
  id: 13_505,
  name: 'Gravity Alpha Sepolia',
  nativeCurrency: {
    name: 'Gravity',
    symbol: 'G',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc-sepolia.gravity.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Gravity Sepolia Explorer',
      url: 'https://explorer-sepolia.gravity.xyz',
    },
  },
});

export type GravityNetwork = 'mainnet' | 'alpha' | 'sepolia';

export function resolveGravityChain(network: GravityNetwork) {
  switch (network) {
    case 'mainnet':
      return gravityMainnet;
    case 'alpha':
      return gravity;
    case 'sepolia':
      return gravitySepolia;
    default:
      return gravityMainnet;
  }
}

export function defaultRpcUrl(network: GravityNetwork): string {
  switch (network) {
    case 'mainnet':
      return 'https://mainnet-rpc.gravity.xyz';
    case 'alpha':
      return 'https://rpc.gravity.xyz';
    case 'sepolia':
      return 'https://rpc-sepolia.gravity.xyz';
    default:
      return 'https://mainnet-rpc.gravity.xyz';
  }
}
