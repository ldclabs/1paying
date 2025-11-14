import { type PaymentLog } from '$lib/types/pay.ts'
import {
  gzipDecompress,
  toMessage,
  type PaymentRequirements
} from '@ldclabs/1paying-kit'
import { base64ToBytes } from '@ldclabs/cose-ts/utils'
import { ed25519 } from '@noble/curves/ed25519'
import { decode } from 'cborg'
import { formatAmount, type TokenInfo } from './token'

type TokenInfoEx = TokenInfo & {
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
    name: 'USDC-devnet',
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
  'base-sepolia:0x036CbD53842c5426634e7929541eC2318f3dCF7e': {
    name: 'USDC-sepolia',
    symbol: 'USDC',
    decimals: 6,
    fee: 0n,
    one: 1000000n,
    logo: 'https://1pay.ing/_assets/images/usdc.webp',
    network: 'base-sepolia',
    address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    chainId: 84532,
    programId: '',
    maxDigits: 4
  }
}

export function getTokenInfo(
  network: string,
  asset: string
): (TokenInfo & { maxDigits: number; programId?: string }) | null {
  return TOKENS[`${network}:${asset}`] || null
}

export function parseAndVerifyPaymentMessage(input: string) {
  const params = new URLSearchParams(input)
  const txid = params.get('txid')
  const msg = params.get('msg')
  if (!txid || !msg) {
    throw new Error('Invalid payment input')
  }

  const sig = base64ToBytes(txid)
  let cborBytes = gzipDecompress(base64ToBytes(msg))

  const message = toMessage(decode(cborBytes))
  const verified = ed25519.verify(sig, cborBytes, message.pubkey)
  if (!verified) {
    throw new Error('Payment message signature verification failed')
  }

  return {
    txid,
    paymentRequirementsResponse: message.payload
  }
}

export function getTxUrl(network: string, tx: string): string {
  if (!network || !tx) {
    return ''
  }

  switch (network) {
    case 'solana':
      return `https://solscan.io/tx/${tx}`
    case 'solana-devnet':
      return `https://solscan.io/tx/${tx}?cluster=devnet`
    case 'base':
      return `https://basescan.org/tx/${tx}`
    case 'base-sepolia':
      return `https://sepolia.basescan.org/tx/${tx}`
    default:
      return ''
  }
}

export function getAssetUrl(token: TokenInfo | null): string {
  switch (token?.network) {
    case 'solana':
      return `https://solscan.io/token/${token.address}`
    case 'solana-devnet':
      return `https://solscan.io/token/${token.address}?cluster=devnet`
    case 'base':
      return `https://basescan.org/token/${token.address}`
    case 'base-sepolia':
      return `https://sepolia.basescan.org/token/${token.address}`
    default:
      return ''
  }
}

export function getAccountUrl(addr: string, token: TokenInfo | null): string {
  switch (token?.network) {
    case 'solana':
      return `https://solscan.io/account/${addr}`
    case 'solana-devnet':
      return `https://solscan.io/account/${addr}?cluster=devnet`
    case 'base':
      return `https://basescan.org/address/${addr}`
    case 'base-sepolia':
      return `https://sepolia.basescan.org/address/${addr}`
    default:
      return ''
  }
}

export function selectedPaymentRequirements(
  accepts: PaymentRequirements[]
): PaymentInfo[] {
  return accepts.map((req) => new PaymentInfo(req))
}

export class PaymentInfo {
  readonly payment: PaymentRequirements
  readonly maxAmountRequired: bigint
  readonly token: TokenInfoEx | null = null
  balance = $state(0n)
  isDisabled = $derived.by(() => {
    return this.token === null || this.balance < this.maxAmountRequired
  })

  constructor(payment: PaymentRequirements) {
    this.payment = payment
    this.maxAmountRequired = BigInt(payment.maxAmountRequired)
    this.token = TOKENS[`${payment.network}:${payment.asset}`] || null
  }

  get assetUrl(): string {
    return getAssetUrl(this.token)
  }

  get payToUrl(): string {
    return getAccountUrl(this.payment.payTo, this.token)
  }

  formatAmount(amount: bigint): string {
    if (!this.token) {
      return 'N/A'
    }

    return formatAmount(amount, this.token.decimals, this.token.maxDigits)
  }

  async fetchBalance(
    api: {
      getBalance: (token: TokenInfoEx, address: string) => Promise<bigint>
    },
    address: string
  ) {
    if (!address) {
      this.balance = 0n
      return
    }

    try {
      this.balance = await api.getBalance(this.token!, address)
    } catch (error) {
      this.balance = 0n
    }
  }
}

export class PaymentLogInfo {
  readonly log: PaymentLog
  readonly maxAmountRequired: bigint
  readonly amountPaid: bigint
  readonly token: TokenInfoEx | null = null

  constructor(log: PaymentLog) {
    this.log = $state(log)
    this.maxAmountRequired = BigInt(log.amountRequired)
    this.amountPaid = BigInt(log.amountPaid)
    this.token = TOKENS[`${log.network}:${log.asset}`] || null
  }

  get assetUrl(): string {
    return getAssetUrl(this.token)
  }

  get payerUrl(): string {
    return getAccountUrl(this.log.payer, this.token)
  }

  get payToUrl(): string {
    return getAccountUrl(this.log.payTo, this.token)
  }

  get txUrl(): string {
    return getTxUrl(this.log.network, this.log.tx || '')
  }

  formatAmount(amount: bigint): string {
    if (!this.token) {
      return 'N/A'
    }

    return formatAmount(amount, this.token.decimals, this.token.maxDigits)
  }
}
