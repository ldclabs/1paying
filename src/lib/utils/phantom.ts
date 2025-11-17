import { ed25519, x25519 } from '@noble/curves/ed25519'
import { randomBytes } from '@noble/hashes/utils'
import { encode, rfc8949EncodeOptions } from 'cborg'
import { bytesToBase64Url } from '@ldclabs/cose-ts/utils'
import { createCborRequest } from './fetcher'
import bs58 from 'bs58'
import nacl from 'tweetnacl'
import { VersionedTransaction, Transaction } from '@solana/web3.js'

const APP_URL = 'https://1pay.ing'
const PHANTOM_ENDPOINT = 'https://phantom.app/ul/v1'
const API_ENDPOINT = 'https://api.1pay.ing/phantom'

type RelayStateInfo = {
  _updatedAt: number
  _expiresAt: number
}

export interface PhantomDeeplinkState {
  cluster: string
  secret: Uint8Array
  phantomXpubkey: string
  session: string
  svmAddress: string
}

export class PhantomDeeplink {
  readonly cluster: string

  #sk: Uint8Array
  #pk: Uint8Array
  #xk: Uint8Array
  #pubkey: string
  #xpubkey: string
  #api
  #sharedSecret: Uint8Array | null = null
  #phantomXpubkey: string = ''
  #session: string = ''
  #svmAddress: string = ''
  #stateExpiresAt: number = 0 // ms

  static fromState(state: PhantomDeeplinkState): PhantomDeeplink {
    const instance = new PhantomDeeplink(
      state.cluster,
      new Uint8Array(state.secret)
    )
    instance.#phantomXpubkey = state.phantomXpubkey
    instance.#session = state.session
    instance.#svmAddress = state.svmAddress
    instance.#sharedSecret = x25519.getSharedSecret(
      instance.#sk,
      bs58.decode(state.phantomXpubkey)
    )
    return instance
  }

  constructor(
    cluster: string = 'mainnet-beta',
    secret: Uint8Array = randomBytes(32)
  ) {
    this.#sk = secret
    this.#pk = ed25519.getPublicKey(this.#sk)
    this.#xk = x25519.getPublicKey(this.#sk)
    this.#pubkey = bytesToBase64Url(this.#pk)
    this.#xpubkey = bs58.encode(this.#xk)
    this.#api = createCborRequest(`${API_ENDPOINT}/${this.#pubkey}`)
    this.cluster = cluster
  }

  get isConnected(): boolean {
    return (
      this.#sharedSecret != null &&
      this.#session != '' &&
      this.#svmAddress != ''
    )
  }

  get address(): string {
    return this.#svmAddress
  }

  toState(): PhantomDeeplinkState {
    return {
      cluster: this.cluster,
      secret: this.#sk,
      phantomXpubkey: this.#phantomXpubkey,
      session: this.#session,
      svmAddress: this.#svmAddress
    }
  }

  async connect(): Promise<void> {
    if (this.isConnected) {
      return
    }

    const { phantom_encryption_public_key, nonce, data } = await this.#call<{
      phantom_encryption_public_key: string
      nonce: string
      data: string
    }>('connect', { app_url: APP_URL, cluster: this.cluster })
    this.#phantomXpubkey = phantom_encryption_public_key
    this.#sharedSecret = x25519.getSharedSecret(
      this.#sk,
      bs58.decode(phantom_encryption_public_key)
    )
    const { public_key, session } = this.#decrypt<{
      public_key: string
      session: string
    }>(data, nonce)
    this.#session = session
    this.#svmAddress = public_key
  }

  async signTransaction(
    transaction: VersionedTransaction | Transaction
  ): Promise<VersionedTransaction | Transaction> {
    const isVersioned = transaction instanceof VersionedTransaction
    let bytes = transaction.serialize({ requireAllSignatures: false })
    const _nonce = nacl.randomBytes(24)
    const payload = this.#encrypt(
      JSON.stringify({
        transaction: bs58.encode(bytes),
        session: this.#session
      }),
      _nonce
    )
    const { nonce, data } = await this.#call<{
      nonce: string
      data: string
    }>('signTransaction', { nonce: bs58.encode(_nonce), payload })

    const { transaction: signedTransaction } = this.#decrypt<{
      transaction: string
    }>(data, nonce)
    bytes = bs58.decode(signedTransaction)
    if (isVersioned) {
      return VersionedTransaction.deserialize(bytes)
    }

    return Transaction.from(bytes)
  }

  async signMessage(message: string | Uint8Array): Promise<{
    signature: Uint8Array
    publicKey: string
  }> {
    const _nonce = nacl.randomBytes(24)
    const payload = this.#encrypt(
      JSON.stringify({
        message: bs58.encode(toBytes(message)),
        session: this.#session,
        display: 'utf8'
      }),
      _nonce
    )
    const { nonce, data } = await this.#call<{
      nonce: string
      data: string
    }>('signMessage', { nonce: bs58.encode(_nonce), payload })

    const { signature } = this.#decrypt<{
      signature: string
    }>(data, nonce)

    return {
      signature: bs58.decode(signature),
      publicKey: this.#svmAddress
    }
  }

  async #tryInitState(): Promise<void> {
    const timestamp = Date.now()
    if (this.#stateExpiresAt < timestamp + 3 * 60 * 1000) {
      const msg = { timestamp } as any
      const signature = this.#sign(encode(msg, rfc8949EncodeOptions))
      msg.signature = signature

      const {
        result: { _expiresAt }
      } = await this.#api.post<{ result: RelayStateInfo }>('', msg)
      this.#stateExpiresAt = _expiresAt
    }
  }

  async #call<T>(method: string, params: Record<string, any>): Promise<T> {
    let attempt = 0
    const startTime = Date.now()
    const timeoutMs = 3 * 60 * 1000

    await this.#tryInitState()
    const ps = new URLSearchParams({
      dapp_encryption_public_key: this.#xpubkey,
      redirect_link: `${API_ENDPOINT}/${this.#pubkey}/${method}/set`,
      ...params
    })
    const url = `${PHANTOM_ENDPOINT}/${method}?${ps.toString()}`
    window.open(url, 'PhantomDeeplink')

    // Initial delay to allow Phantom processing to start
    await new Promise((resolve) => setTimeout(resolve, 5000))
    while (true) {
      attempt += 1

      try {
        const { result } = await this.#api.get<{ result: T & RelayStateInfo }>(
          `/${method}`
        )
        this.#stateExpiresAt = result._expiresAt
        return result
      } catch {
        if (Date.now() - startTime > timeoutMs) {
          throw new Error('Timeout waiting for payment payload')
        }

        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }
  }

  #encrypt(data: string | Uint8Array, nonce: Uint8Array): string {
    if (!this.#sharedSecret) {
      throw new Error('Shared secret is not established')
    }

    const encryptedData = nacl.box.after(
      toBytes(data),
      nonce,
      this.#sharedSecret
    )
    return bs58.encode(encryptedData)
  }

  #decrypt<T>(data: string, nonce: string): T {
    if (!this.#sharedSecret) {
      throw new Error('Shared secret is not established')
    }

    const decryptedData = nacl.box.open.after(
      bs58.decode(data),
      bs58.decode(nonce),
      this.#sharedSecret
    )
    if (!decryptedData) {
      throw new Error('Unable to decrypt data')
    }
    return JSON.parse(Buffer.from(decryptedData).toString('utf8'))
  }

  #sign(message: Uint8Array): Uint8Array {
    return ed25519.sign(message, this.#sk)
  }

  verify(message: Uint8Array, signature: Uint8Array): boolean {
    return ed25519.verify(signature, message, this.#pk)
  }
}

function toBytes(data: string | Uint8Array): Uint8Array {
  return data instanceof Uint8Array ? data : Buffer.from(data, 'utf8')
}

export const deeplinkPhantom = new PhantomDeeplink()
