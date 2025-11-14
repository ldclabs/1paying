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

export interface Message<T> {
  pubkey: Uint8Array // 32 bytes ed25519 pubkey
  nonce: number
  payload: T
}

export interface MessageCompact<TC> {
  pk: Uint8Array // pubkey
  n: number // nonce
  p: TC // payload
}

export function toMessage(
  msg: MessageCompact<PaymentRequirementsCompact> | Message<PaymentRequirements>
): Message<PaymentRequirements> {
  if ('pubkey' in msg && 'nonce' in msg && 'payload' in msg) {
    return msg
  }

  return {
    pubkey: msg.pk,
    nonce: msg.n,
    payload: toPaymentRequirements(msg.p)
  }
}

export function toMessageCompact(
  msg: MessageCompact<PaymentRequirementsCompact> | Message<PaymentRequirements>
): MessageCompact<PaymentRequirementsCompact> {
  if ('pk' in msg && 'n' in msg && 'p' in msg) {
    return msg
  }

  return {
    pk: msg.pubkey,
    n: msg.nonce,
    p: toPaymentRequirementsCompact(msg.payload)
  }
}

export interface PaymentRequirements {
  /// Payment scheme identifier (e.g., "exact")
  scheme: 'exact' | 'upto'
  /// Blockchain network identifier (e.g., "icp-druyg-tyaaa-aaaaq-aactq-cai")
  network: string
  /// Required payment amount in atomic token units
  maxAmountRequired: string
  /// Token ledger canister address
  asset: string
  /// Recipient wallet address for the payment
  payTo: string
  /// the protected resource, e.g., URL of the resource endpoint
  resource: string
  /// Human-readable description of the resource
  description: string
  /// MIME type of the expected response
  mimeType?: string
  /// JSON schema describing the response format
  outputSchema?: object
  /// Maximum time allowed for payment completion in seconds
  maxTimeoutSeconds: number
  /// Scheme-specific additional information.
  extra?: object
}

export interface PaymentRequirementsCompact {
  s: 'exact' | 'upto' // scheme
  n: string // network
  mar: string // maxAmountRequired
  a: string // asset
  p: string // payTo
  r: string // resource
  d: string // description
  mt?: string // mimeType
  os?: object // outputSchema
  mts: number // maxTimeoutSeconds
  ex?: object // extra
}

export function toPaymentRequirements(
  req: PaymentRequirementsCompact | PaymentRequirements
): PaymentRequirements {
  if ('scheme' in req) {
    return req
  }

  const obj: PaymentRequirements = {
    scheme: req.s,
    network: req.n,
    maxAmountRequired: req.mar,
    asset: req.a,
    payTo: req.p,
    resource: req.r,
    description: req.d,
    maxTimeoutSeconds: req.mts
  }
  if (req.mt) {
    obj.mimeType = req.mt
  }
  if (req.os) {
    obj.outputSchema = req.os
  }
  if (req.ex) {
    obj.extra = req.ex
  }
  return obj
}

export function toPaymentRequirementsCompact(
  req: PaymentRequirementsCompact | PaymentRequirements
): PaymentRequirementsCompact {
  if ('s' in req) {
    return req
  }

  const obj: PaymentRequirementsCompact = {
    s: req.scheme,
    n: req.network,
    mar: req.maxAmountRequired,
    a: req.asset,
    p: req.payTo,
    r: req.resource,
    d: req.description,
    mts: req.maxTimeoutSeconds
  }
  if (req.mimeType) {
    obj.mt = req.mimeType
  }
  if (req.outputSchema) {
    obj.os = req.outputSchema
  }
  if (req.extra) {
    obj.ex = req.extra
  }
  return obj
}

export interface PaymentRequirementsResponse {
  x402Version: number
  error: string
  accepts: PaymentRequirements[]
}

export interface PaymentRequirementsResponseCompact {
  x: number // x402Version
  e: string // error
  a: PaymentRequirementsCompact[] // accepts
}

export interface PaymentPayload<T> {
  x402Version: number
  scheme: string
  network: string
  payload: T
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

export interface UserProfile {
  id: string
  name: string
  addresses: string[]
  createdAt: number // timestamp in milliseconds
}
