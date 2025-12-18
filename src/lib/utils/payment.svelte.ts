import { type PaymentLog, type PartialPaymentLog } from '$lib/types/pay.ts'
import {
  tryDecompress,
  toMessage,
  base64ToBytes,
  type PaymentRequirements,
  type PaymentRequirementsV1
} from '@ldclabs/1paying-kit'
import { ed25519 } from '@noble/curves/ed25519'
import { decode } from 'cborg'
import { formatAmount, type TokenInfo } from './token'
import { getTokenInfo, type TokenInfoEx } from './payment.token'
import { Xid } from 'xid-ts'
import {
  stringToBase64,
  type PaymentRequirementsResponse,
  type PaymentRequired,
  type ResourceInfo
} from '@ldclabs/1paying-kit'

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
    paymentRequired: message.payload
  }
}

function getTxUrl(network: string, tx: string): string {
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
    case 'base-testnet':
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
    case 'base-testnet':
      return `https://sepolia.basescan.org/token/${token.address}`
    case 'icp':
      return `https://www.icexplorer.io/token/details/${token.address}`
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
    case 'base-testnet':
      return `https://sepolia.basescan.org/address/${addr}`
    case 'icp':
      return `https://www.icexplorer.io/address/details/${addr}`
    default:
      return ''
  }
}

export function getNetwork(network: string): string {
  switch (network) {
    case 'icp':
    case 'icp:1':
      return 'icp'
    case 'solana':
    case 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp':
      return 'solana'
    case 'solana-devnet':
    case 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1':
      return 'solana-devnet'
    case 'base':
    case 'eip155:8453':
      return 'base'
    case 'base-sepolia':
    case 'eip155:84532':
      return 'base-testnet'
    default:
      return ''
  }
}

export function selectedPaymentRequirements(
  paymentRequired: PaymentRequirementsResponse | PaymentRequired,
  supportNetworks: string[]
): PaymentInfo[] {
  return paymentRequired.accepts.map(
    (req) => new PaymentInfo(paymentRequired, req, supportNetworks)
  )
}

export class PaymentInfo {
  #payment: PaymentRequirements | PaymentRequirementsV1
  #paymentRequired: PaymentRequirementsResponse | PaymentRequired
  readonly id: string
  readonly amountRequired: bigint
  readonly token: TokenInfoEx | null = null
  supportNetworks: string[]
  balance = $state(0n)
  isDisabled = $derived.by(() => {
    return (
      this.token === null ||
      this.balance < this.amountRequired ||
      !this.supportNetworks.includes(this.network)
    )
  })

  constructor(
    paymentRequired: PaymentRequirementsResponse | PaymentRequired,
    payment: PaymentRequirements | PaymentRequirementsV1,
    supportNetworks: string[]
  ) {
    this.id = new Xid().toString()
    this.#payment = payment
    this.#paymentRequired = paymentRequired
    this.amountRequired =
      'maxAmountRequired' in payment
        ? BigInt(payment.maxAmountRequired)
        : BigInt(payment.amount)
    this.token = getTokenInfo(getNetwork(payment.network), payment.asset)
    this.supportNetworks = supportNetworks
  }

  get payment(): PaymentRequirements | PaymentRequirementsV1 {
    return this.#payment
  }

  get x402Version(): number {
    return this.#paymentRequired.x402Version
  }

  get network(): string {
    return getNetwork(this.#payment.network)
  }

  get originNetwork(): string {
    return this.#payment.network
  }

  get assetUrl(): string {
    return getAssetUrl(this.token)
  }

  get payToUrl(): string {
    return getAccountUrl(this.#payment.payTo, this.token)
  }

  get feePayer(): string | null {
    return this.#payment.extra
      ? 'feePayer' in this.#payment.extra
        ? (this.#payment.extra['feePayer'] as string)
        : null
      : null
  }

  resource(): ResourceInfo {
    return 'resource' in this.#paymentRequired
      ? this.#paymentRequired.resource
      : {
          url: (this.#payment as PaymentRequirementsV1).resource,
          description: (this.#payment as PaymentRequirementsV1).description,
          mimeType: (this.#payment as PaymentRequirementsV1).mimeType as string
        }
  }

  toPaymentPayloadBase64(payload: unknown): string {
    const paymentPayload =
      this.#paymentRequired.x402Version === 1
        ? {
            x402Version: 1,
            scheme: this.#payment.scheme,
            network: this.#payment.network,
            payload
          }
        : {
            x402Version: 2,
            resource: (this.#paymentRequired as PaymentRequired).resource,
            accepted: this.#payment,
            payload,
            extensions: (this.#paymentRequired as PaymentRequired).extensions
          }
    return stringToBase64(JSON.stringify(paymentPayload))
  }

  toLog(payer: string): PartialPaymentLog {
    const resource = this.resource()
    return {
      x402Version: this.#paymentRequired.x402Version,
      network: this.#payment.network,
      scheme: this.#payment.scheme,
      payer,
      payTo: this.#payment.payTo,
      asset: this.#payment.asset,
      resource: resource.url,
      description: resource.description || '',
      amountRequired: this.amountRequired.toString(),
      amountPaid: this.amountRequired.toString(),
      txStatus: 'pending',
      signedAt: Date.now()
    }
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
  readonly amountRequired: bigint
  readonly amountPaid: bigint
  readonly token: TokenInfoEx | null = null

  constructor(log: PaymentLog) {
    this.log = $state(log)
    this.amountRequired = BigInt(log.amountRequired)
    this.amountPaid = BigInt(log.amountPaid)
    this.token = getTokenInfo(getNetwork(log.network), log.asset)
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
    return getTxUrl(getNetwork(this.log.network), this.log.tx || '')
  }

  formatAmount(amount: bigint): string {
    if (!this.token) {
      return 'N/A'
    }

    return formatAmount(amount, this.token.decimals, this.token.maxDigits)
  }
}
