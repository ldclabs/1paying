import { type Message } from '@ldclabs/1paying-kit'

export interface Transaction<T> {
  message: Message<T>
  signature: Uint8Array
}

export interface TransactionResult<T> {
  status: 'pending' | 'accepted' | 'completed' | 'error' | 'dropped'
  error?: { code: number; message: string; data?: unknown }
  result?: T
  log?: PartialPaymentLog
}

export interface PartialPaymentLog {
  x402Version: number
  network: string
  scheme: string
  payer: string
  payTo: string
  asset: string
  resource: string
  description: string
  amountRequired: string // bigint as string
  amountPaid: string // bigint as string
  tx?: string
  txStatus: 'pending' | 'confirmed' | 'finalized' | 'failed'
  signedAt: number // timestamp in milliseconds
}

export interface PaymentLog {
  id: string
  x402Version: number
  network: string
  scheme: string
  payer: string
  payTo: string
  asset: string
  resource: string
  description: string
  amountRequired: string // bigint as string
  amountPaid: string // bigint as string
  tx?: string
  txStatus: 'pending' | 'confirmed' | 'finalized' | 'failed'
  signedAt: number // timestamp in milliseconds
  updatedAt: number // timestamp in milliseconds
}

export interface UserProfile {
  id: string
  name: string
  addresses: string[]
  createdAt: number // timestamp in milliseconds
}

export interface SvmPayload {
  transaction: string
}

export interface EvmPayload {
  signature: string
  authorization: EvmPayloadAuthorization
}

export interface EvmPayloadAuthorization {
  from: string
  to: string
  value: string
  validAfter: string
  validBefore: string
  nonce: string
}

export interface IcpPayload {
  signature: string
  authorization: IcpPayloadAuthorization
}

export interface IcpPayloadAuthorization {
  to: string
  value: string
  expiresAt: number
  nonce: number
}
