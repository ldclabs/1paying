import { type TokenInfo } from './token'

export type TokenInfoEx = TokenInfo & {
  maxDigits: number
  programId: string
  chainId: number
}

const TOKENS: Record<string, TokenInfoEx> = {
  'icp:ryjl3-tyaaa-aaaaa-aaaba-cai': {
    name: 'ICP',
    symbol: 'ICP',
    decimals: 8,
    fee: 10000n,
    one: 100000000n,
    logo: 'https://1pay.ing/_assets/images/icp.webp',
    network: 'icp',
    address: 'ryjl3-tyaaa-aaaaa-aaaba-cai',
    programId: '',
    chainId: 0,
    maxDigits: 4
  },
  'icp:druyg-tyaaa-aaaaq-aactq-cai': {
    name: 'ICPanda',
    symbol: 'PANDA',
    decimals: 8,
    fee: 10000n,
    one: 100000000n,
    logo: 'https://1pay.ing/_assets/images/panda.webp',
    network: 'icp',
    address: 'druyg-tyaaa-aaaaq-aactq-cai',
    programId: '',
    chainId: 0,
    maxDigits: 4
  },
  'solana:So11111111111111111111111111111111111111111': {
    name: 'SOL',
    symbol: 'SOL',
    decimals: 9,
    fee: 0n,
    one: 1000000000n,
    logo: 'https://1pay.ing/_assets/images/sol.webp',
    network: 'solana',
    address: 'So11111111111111111111111111111111111111111',
    programId: '',
    chainId: 0,
    maxDigits: 4
  },
  'solana:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 6,
    fee: 0n,
    one: 1000000n,
    logo: 'https://1pay.ing/_assets/images/usdc.webp',
    network: 'solana',
    address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
    chainId: 0,
    maxDigits: 4
  },
  'solana:Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': {
    name: 'USDT',
    symbol: 'USDT',
    decimals: 6,
    fee: 0n,
    one: 1000000n,
    logo: 'https://1pay.ing/_assets/images/usdt.webp',
    network: 'solana',
    address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
    chainId: 0,
    maxDigits: 4
  },
  'solana:PAYiNGqaLFRdBomkQY3JXZeCm7wzK7hKuhrJDzcZBWN': {
    name: '1Pay.ing',
    symbol: 'PAY',
    decimals: 9,
    fee: 0n,
    one: 1000000000n,
    logo: 'https://1pay.ing/_assets/images/pay.webp',
    network: 'solana',
    address: 'PAYiNGqaLFRdBomkQY3JXZeCm7wzK7hKuhrJDzcZBWN',
    programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
    chainId: 0,
    maxDigits: 4
  },
  'solana-devnet:4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU': {
    name: 'USDC-test',
    symbol: 'USDC',
    decimals: 6,
    fee: 0n,
    one: 1000000n,
    logo: 'https://1pay.ing/_assets/images/usdc.webp',
    network: 'solana-devnet',
    address: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
    programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
    chainId: 0,
    maxDigits: 4
  },
  'base:0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913': {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 6,
    fee: 0n,
    one: 1000000n,
    logo: 'https://1pay.ing/_assets/images/usdc.webp',
    network: 'base',
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    programId: '',
    chainId: 8453,
    maxDigits: 4
  },
  'base-testnet:0x036CbD53842c5426634e7929541eC2318f3dCF7e': {
    name: 'USDC-test',
    symbol: 'USDC',
    decimals: 6,
    fee: 0n,
    one: 1000000n,
    logo: 'https://1pay.ing/_assets/images/usdc.webp',
    network: 'base-testnet',
    address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    chainId: 84532,
    programId: '',
    maxDigits: 4
  }
}

export function getTokenInfo(
  network: string,
  asset: string
): TokenInfoEx | null {
  return TOKENS[`${network}:${asset}`] || null
}
