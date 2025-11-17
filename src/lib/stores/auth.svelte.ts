import { SignInAPI } from '$lib/canisters/signin'
import { IS_LOCAL, SIGNIN_CANISTER_ID } from '$lib/constants'
import {
  anonymousIdentity,
  createAuthClient,
  dynAgent,
  EXPIRATION_MS,
  IdentityEx,
  loadIdentity,
  loadMyIdentity,
  removeMyIdentity,
  setMyIdentity
} from '$lib/utils/auth'
import { toUint8Array } from '$lib/utils/helper'
import { popupCenter } from '$lib/utils/window'
import { type DerEncodedPublicKey, type Signature } from '@dfinity/agent'
import {
  Delegation,
  DelegationChain,
  Ed25519KeyIdentity,
  Ed25519PublicKey
} from '@dfinity/identity'
import { hexToBytes } from '@noble/hashes/utils'
import {
  AddressType,
  BrowserSDK,
  type WalletAddress
} from '@phantom/browser-sdk'
import { paymentStore } from './payment.svelte'
import { KVStore } from '$lib/utils/store'
import { PhantomDeeplink, type PhantomDeeplinkState } from '$lib/utils/phantom'
import { type SvmSigner } from '$lib/utils/svmrpc'
import { type EvmSigner } from '$lib/utils/evmrpc'
import { type AuthClient } from '@dfinity/auth-client'
import { type SignInResponse } from '$lib/canisters/signin'

const DOMAIN = '1pay.ing'
const IDENTITY_PROVIDER = IS_LOCAL
  ? 'http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943'
  : 'https://id.ai'

const ICP_NETWORKS = ['icp']
const SVM_NETWORKS = ['solana', 'solana-devnet']
const EVM_NETWORKS = ['base', 'base-sepolia']

const signInAPI = new SignInAPI(SIGNIN_CANISTER_ID)

const authClientPromise = createAuthClient()
let authClient: AuthClient | null = null
authClientPromise.then((client) => {
  authClient = client
})

const globalKV = new KVStore(DOMAIN, 1, [['State'], ['Users']])

export const EventLogin = 'Login'

export const hasPhantomSDK =
  typeof window !== 'undefined' &&
  'phantom' in window &&
  (window as any).phantom?.solana != null

let phantomSdk = new BrowserSDK({
  providerType: 'injected',
  addressTypes: [AddressType.solana, AddressType.ethereum]
})
let phantomDeeplink = new PhantomDeeplink()

export interface SignInWithParams {
  domain: string
  address: string
  now: bigint
  message: string
}

export interface SignInWithResponse {
  svmAddress: string
  evmAddress: string
  signInResponse: SignInResponse
}

class AuthStore extends EventTarget {
  static async init() {
    // Fetch the root key for local development
    if (IS_LOCAL) {
      await Promise.all([dynAgent.fetchRootKey(), dynAgent.syncTime()])
    }
    await authClientPromise
    let supportNetworks = [...ICP_NETWORKS]
    let identity: IdentityEx | null

    const phantomDeeplinkState = await globalKV.get<PhantomDeeplinkState>(
      'State',
      'PhantomDeeplink'
    )
    if (phantomDeeplinkState && phantomDeeplinkState.phantomXpubkey) {
      phantomDeeplink = PhantomDeeplink.fromState(phantomDeeplinkState)
    }

    identity = await loadMyIdentity()
    if (!identity) {
      identity = await loadIdentity(authClient!)
    } else {
      // verify wallet connection
      const ok = await checkIdentity(identity)
      if (!ok) {
        console.warn('Stored identity does not match connected wallet')
        identity = null
      } else {
        if (identity.svmAddress) {
          supportNetworks = [...supportNetworks, ...SVM_NETWORKS]
        }

        if (identity.evmAddress) {
          supportNetworks = [...supportNetworks, ...EVM_NETWORKS]
        }
      }
    }

    if (identity) {
      AuthStore.#login(identity, supportNetworks)
    }
  }

  static #login(identity: IdentityEx, supportNetworks: string[]) {
    identity.expiredHook = () => authStore.logout()
    dynAgent.setIdentity(identity)
    paymentStore.setIdentity(identity)
    authStore.#identity = identity
    authStore.#supportNetworks = supportNetworks
    authStore.dispatchEvent(
      new CustomEvent(EventLogin, { detail: identity.getPrincipal().toText() })
    )
  }

  #identity = $state<IdentityEx>(anonymousIdentity)
  #supportNetworks = $state<string[]>([
    ...ICP_NETWORKS,
    ...SVM_NETWORKS,
    ...EVM_NETWORKS
  ])

  constructor() {
    super()
  }

  get backedBy() {
    return this.#identity.backedBy
  }

  get identity() {
    return this.#identity
  }

  get supportNetworks() {
    return this.#supportNetworks
  }

  get phantomConnected() {
    return phantomDeeplink.isConnected() || phantomSdk.isConnected()
  }

  get svmSigner(): SvmSigner | null {
    if (this.#identity.svmAddress) {
      if (phantomDeeplink.isConnected()) {
        return phantomDeeplink
      }
      return phantomSdk.solana
    }
    return null
  }

  get evmSigner(): EvmSigner | null {
    if (this.#identity.evmAddress) {
      return phantomSdk.ethereum
    }
    return null
  }

  async ready() {
    if (!authClient) {
      await authClientPromise
    }
  }

  signIn(identityProvider = IDENTITY_PROVIDER): Promise<null> {
    if (!authClient) {
      return Promise.reject(new Error('AuthClient not initialized'))
    }

    let resolve: (rt: any) => void, reject: (reason?: any) => void
    const promise = new Promise<null>(async (_resolve, _reject) => {
      resolve = _resolve
      reject = _reject
    })

    // 确保 window.open 在用户点击事件的同步调用栈内被触发，以避免被浏览器拦截
    // Important: authClientPromise should be resolved here
    // https://ffan0811.medium.com/window-open-returns-null-in-safari-and-firefox-after-allowing-pop-up-on-the-browser-4e4e45e7d926
    authClient.login({
      maxTimeToLive: BigInt(EXPIRATION_MS) * 1000000n,
      identityProvider,
      onSuccess: (msg) => {
        const authnMethod = msg.authnMethod
        const authnOrigin = location.origin
        console.log(`Login successful using ${authnMethod} from ${authnOrigin}`)

        const identity = new IdentityEx(
          authClient!.getIdentity(),
          Date.now() + EXPIRATION_MS
        )

        AuthStore.#login(identity, [...ICP_NETWORKS])
        resolve(null)
      },
      onError: (err) => {
        console.error(err)
        reject(err)
      },
      windowOpenerFeatures: popupCenter({
        width: 576,
        height: 625
      })
    })

    return promise
  }

  signInWithPhantom(
    params: SignInWithParams | null = null
  ): Promise<SignInWithParams | null> {
    if (!authClient) {
      return Promise.reject(new Error('AuthClient not initialized'))
    }

    const sessionKey = Ed25519KeyIdentity.generate()
    const sessionPubkey = new Uint8Array(
      (sessionKey.getPublicKey() as Ed25519PublicKey).toDer()
    )
    const promise = hasPhantomSDK
      ? this.#signInWithPhantomExtension(sessionKey)
      : this.#signInWithPhantomDeeplink(sessionKey, params)

    return promise.then(async (res) => {
      const { svmAddress, evmAddress, signInResponse } =
        res as SignInWithResponse
      if (!signInResponse) {
        return res as SignInWithParams
      }

      const signedDelegation = await signInAPI.getDelegation(
        signInResponse.seed as Uint8Array,
        sessionPubkey,
        signInResponse.expiration
      )

      const chain = DelegationChain.fromDelegations(
        [
          {
            delegation: new Delegation(
              toUint8Array(signedDelegation.delegation.pubkey),
              signedDelegation.delegation.expiration,
              signedDelegation.delegation.targets[0]
            ),
            signature: toUint8Array(
              signedDelegation.signature,
              '__signature__'
            ) as Signature
          }
        ],
        toUint8Array(
          signInResponse.user_key,
          '__derEncodedPublicKey__'
        ) as DerEncodedPublicKey
      )
      const identity = await setMyIdentity({
        identity: sessionKey,
        chain,
        svmAddress,
        evmAddress,
        backedBy: 'Phantom'
      })
      let supportNetworks = [...ICP_NETWORKS]
      if (identity.svmAddress) {
        supportNetworks = [...supportNetworks, ...SVM_NETWORKS]
      }
      if (identity.evmAddress) {
        supportNetworks = [...supportNetworks, ...EVM_NETWORKS]
      }

      AuthStore.#login(identity, supportNetworks)

      return null
    })
  }

  async getSignInWithSolanaMessage(): Promise<SignInWithParams> {
    const now = BigInt(Date.now())
    const address = phantomDeeplink.address
    const message = await signInAPI.getSignInWithSolanaMessage(
      DOMAIN,
      address,
      now
    )
    return {
      domain: DOMAIN,
      address,
      message,
      now
    }
  }

  async #signInWithPhantomExtension(
    sessionKey: Ed25519KeyIdentity
  ): Promise<SignInWithResponse> {
    const addresses = await tryConnectPhantomSDK()
    if (addresses.length === 0) {
      throw new Error('No addresses returned from Phantom wallet')
    }

    const { addressType, address } = addresses[0]!
    const sessionPubkey = new Uint8Array(
      (sessionKey.getPublicKey() as Ed25519PublicKey).toDer()
    )
    const nowMs = BigInt(Date.now())
    let svmAddress: string = ''
    let evmAddress: string = ''
    if (addressType == AddressType.solana) {
      svmAddress = address
      if (addresses[1] && addresses[1]!.addressType == AddressType.ethereum) {
        evmAddress = addresses[1]!.address
      }
      const message = await signInAPI.getSignInWithSolanaMessage(
        DOMAIN,
        address,
        nowMs
      )
      const { signature, publicKey } =
        await phantomSdk.solana.signMessage(message)
      if (publicKey !== address) {
        throw new Error('Signed public key does not match the address')
      }
      const sessionSig = await sessionKey.sign(signature)
      const signInResponse = await signInAPI.signInWithSolana(
        DOMAIN,
        address,
        nowMs,
        message,
        signature,
        sessionPubkey,
        sessionSig
      )

      return {
        svmAddress,
        evmAddress,
        signInResponse
      }
    } else if (addressType == AddressType.ethereum) {
      const [accounts, chainId] = await Promise.all([
        phantomSdk.ethereum.request({
          method: 'eth_accounts'
        }),
        phantomSdk.ethereum.request({
          method: 'eth_chainId'
        })
      ])

      if (accounts.length === 0 || accounts[0] !== address) {
        throw new Error('Ethereum address mismatch')
      }

      const _chainId = parseInt(chainId, 16)
      evmAddress = address
      if (addresses[1] && addresses[1]!.addressType == AddressType.solana) {
        svmAddress = addresses[1]!.address
      }
      const message = await signInAPI.getSignInWithEthereumMessage(
        DOMAIN,
        address,
        _chainId,
        nowMs
      )
      const signature = await phantomSdk.ethereum.signPersonalMessage(
        message,
        address
      )

      const sig = hexToBytes(signature.replace(/^0x/, ''))
      const sessionSig = await sessionKey.sign(sig)
      const signInResponse = await signInAPI.signInWithEthereum(
        DOMAIN,
        address,
        _chainId,
        nowMs,
        message,
        sig,
        sessionPubkey,
        sessionSig
      )
      return {
        svmAddress,
        evmAddress,
        signInResponse
      }
    } else {
      throw new Error(`Unsupported address type: ${addressType}`)
    }
  }

  #signInWithPhantomDeeplink(
    sessionKey: Ed25519KeyIdentity,
    params: SignInWithParams | null = null
  ): Promise<SignInWithParams | SignInWithResponse> {
    if (params) {
      const promise = phantomDeeplink.signMessage(params.message)
      return promise.then(async ({ signature, publicKey }) => {
        if (publicKey !== params.address) {
          throw new Error('Signed public key does not match the address')
        }
        const sessionPubkey = new Uint8Array(
          (sessionKey.getPublicKey() as Ed25519PublicKey).toDer()
        )
        const sessionSig = await sessionKey.sign(signature)
        const signInResponse = await signInAPI.signInWithSolana(
          DOMAIN,
          publicKey,
          params.now,
          params.message,
          signature,
          sessionPubkey,
          sessionSig
        )
        return {
          svmAddress: params.address,
          evmAddress: '', // deeplink only supports Solana for now
          signInResponse
        }
      })
    }

    const promise = !phantomDeeplink.isConnected()
      ? phantomDeeplink.connect()
      : Promise.resolve()

    return promise.then(async () => {
      await globalKV.set('State', phantomDeeplink.toState(), 'PhantomDeeplink')
      return await this.getSignInWithSolanaMessage()
    })
  }

  async logout(url: string = '/app') {
    this.#identity = anonymousIdentity
    this.#supportNetworks = [...ICP_NETWORKS, ...SVM_NETWORKS, ...EVM_NETWORKS]
    dynAgent.setIdentity(anonymousIdentity)
    phantomSdk.disconnect()

    await removeMyIdentity()
    phantomDeeplink = new PhantomDeeplink()
    await globalKV.delete('State', 'PhantomDeeplink')

    await authClient!.logout()
    url && window.location.assign(url) // force reload to clear all auth state!!
  }
}

export const authStore = new AuthStore()

AuthStore.init().catch((err) => {
  console.error('Failed to initialize AuthStore', err)
})

async function tryConnectPhantomSDK(): Promise<WalletAddress[]> {
  if (!hasPhantomSDK) return []

  phantomSdk = new BrowserSDK({
    providerType: 'injected',
    addressTypes: [AddressType.solana, AddressType.ethereum]
  })
  try {
    const { addresses } = await phantomSdk.connect({
      provider: 'injected'
    })
    return addresses
  } catch {
    phantomSdk = new BrowserSDK({
      providerType: 'injected',
      addressTypes: [AddressType.solana]
    })
    const { addresses } = await phantomSdk.connect({
      provider: 'injected'
    })
    return addresses
  }
}

async function checkIdentity(identity: IdentityEx) {
  if (hasPhantomSDK) {
    const addresses = await tryConnectPhantomSDK()

    if (addresses.length === 0) {
      return false
    }
    for (const { addressType, address } of addresses) {
      switch (addressType) {
        case AddressType.solana:
          if (identity.svmAddress !== address) {
            return false
          }
          break
        case AddressType.ethereum:
          if (identity.evmAddress !== address) {
            return false
          }
          break
      }
    }

    return true
  }

  if (phantomDeeplink.isConnected()) {
    if (identity.svmAddress !== phantomDeeplink.address) {
      return false
    }
    if (identity.evmAddress) {
      return false
    }
    return true
  }

  return identity.svmAddress == '' && identity.evmAddress == ''
}
