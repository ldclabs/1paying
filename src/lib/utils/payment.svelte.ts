import { type PaymentLog } from '$lib/types/pay.ts'
import {
  tryDecompress,
  toMessage,
  base64ToBytes,
  type PaymentRequirements
} from '@ldclabs/1paying-kit'
import { ed25519 } from '@noble/curves/ed25519'
import { decode } from 'cborg'
import { formatAmount, type TokenInfo } from './token'
import { getTokenInfo, type TokenInfoEx } from './payment.token'
import { Xid } from 'xid-ts'

export async function parseAndVerifyPaymentMessage(input: string) {
  const params = new URLSearchParams(input)
  const txid = params.get('txid')
  const msg = params.get('msg')
  if (!txid || !msg) {
    throw new Error('Invalid payment input')
  }

  const sig = base64ToBytes(txid)
  let cborBytes = await tryDecompress(base64ToBytes(msg))

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
  accepts: PaymentRequirements[],
  supportNetworks: string[]
): PaymentInfo[] {
  return accepts.map((req) => new PaymentInfo(req, supportNetworks))
}

export class PaymentInfo {
  readonly id: string
  readonly payment: PaymentRequirements
  readonly maxAmountRequired: bigint
  readonly token: TokenInfoEx | null = null
  supportNetworks: string[]
  balance = $state(0n)
  isDisabled = $derived.by(() => {
    return (
      this.token === null ||
      this.balance < this.maxAmountRequired ||
      !this.supportNetworks.includes(this.payment.network)
    )
  })

  constructor(payment: PaymentRequirements, supportNetworks: string[]) {
    this.id = new Xid().toString()
    this.payment = payment
    this.maxAmountRequired = BigInt(payment.maxAmountRequired)
    this.token = getTokenInfo(payment.network, payment.asset)
    this.supportNetworks = supportNetworks
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
    this.token = getTokenInfo(log.network, log.asset)
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
