import {
  idlFactory,
  type SignInResponse,
  type SignedDelegation,
  type _SERVICE
} from '$declarations/ic_signin_with/ic_signin_with.did.js'
import { unwrapResult } from '$lib/types/result'
import { Principal } from '@dfinity/principal'
import { createActor } from './actors'

export type {
  SignInResponse,
  SignedDelegation
} from '$declarations/ic_signin_with/ic_signin_with.did.js'

export class SignInAPI {
  readonly canisterId: Principal
  #actor: _SERVICE

  constructor(canisterId: string) {
    this.canisterId = Principal.fromText(canisterId)
    this.#actor = createActor<_SERVICE>({
      canisterId,
      idlFactory: idlFactory
    })
  }

  async myIv(): Promise<Uint8Array> {
    const res = await this.#actor.my_iv()
    const iv = unwrapResult(res, 'call my_iv failed')
    return new Uint8Array(iv)
  }

  async getDelegation(
    seed: Uint8Array,
    pubkey: Uint8Array,
    expiration_ms: bigint
  ): Promise<SignedDelegation> {
    const res = await this.#actor.get_delegation(seed, pubkey, expiration_ms)
    return unwrapResult(res, 'call get_delegation failed')
  }

  async getSignInWithSolanaMessage(
    domain: string,
    address: string,
    now_ms: bigint
  ): Promise<string> {
    const res = await this.#actor.get_sign_in_with_solana_message(
      domain,
      address,
      now_ms
    )
    return unwrapResult(res, 'call get_sign_in_with_solana_message failed')
  }

  async signInWithSolana(
    domain: string,
    address: string,
    now_ms: bigint,
    message: string,
    message_sig: Uint8Array,
    session_pubkey: Uint8Array,
    session_sig: Uint8Array
  ): Promise<SignInResponse> {
    const res = await this.#actor.sign_in_with_solana(
      domain,
      address,
      now_ms,
      message,
      message_sig,
      session_pubkey,
      session_sig
    )
    return unwrapResult(res, 'call sign_in failed')
  }

  async getSignInWithEthereumMessage(
    domain: string,
    address: string,
    chain_id: number,
    now_ms: bigint
  ): Promise<string> {
    const res = await this.#actor.get_sign_in_with_ethereum_message(
      domain,
      address,
      chain_id,
      now_ms
    )
    return unwrapResult(res, 'call get_sign_in_with_ethereum_message failed')
  }

  async signInWithEthereum(
    domain: string,
    address: string,
    chain_id: number,
    now_ms: bigint,
    message: string,
    message_sig: Uint8Array,
    session_pubkey: Uint8Array,
    session_sig: Uint8Array
  ): Promise<SignInResponse> {
    const res = await this.#actor.sign_in_with_ethereum(
      domain,
      address,
      chain_id,
      now_ms,
      message,
      message_sig,
      session_pubkey,
      session_sig
    )
    return unwrapResult(res, 'call sign_in failed')
  }
}
