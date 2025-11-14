import { type SignedEnvelope } from '@ldclabs/ic-auth'

export interface AuthorizationRequest {
  message: AuthorizationMessage // 1Paying client session delegation
  signature: SignedEnvelope // ICP style signed envelope
}

export interface AuthorizationMessage {
  issuer: string // CWT issuer
  expiration: bigint // expiration time as unix timestamp in seconds
  audience?: string
  notBefore?: bigint
  nonce?: string
}
