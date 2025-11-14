import type { SignInResponse } from '$lib/canisters/signin'
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
import { AddressType, BrowserSDK } from '@phantom/browser-sdk'
import { paymentStore } from './payment.svelte'

const DOMAIN = '1pay.ing'
const IDENTITY_PROVIDER = IS_LOCAL
  ? 'http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943'
  : 'https://id.ai'

const signInAPI = new SignInAPI(SIGNIN_CANISTER_ID)

const authClientPromise = createAuthClient()
const fullSupportNetworks = [
  'icp',
  'solana',
  'solana-devnet',
  'base',
  'base-sepolia'
]

export const phantomSdk = new BrowserSDK({
  providerType: 'injected',
  addressTypes: [AddressType.solana, AddressType.ethereum]
})

class AuthStore {
  static async init() {
    // Fetch the root key for local development
    if (IS_LOCAL) {
      await Promise.all([dynAgent.fetchRootKey(), dynAgent.syncTime()])
    }
    const authClient = await authClientPromise
    let supportNetworks = ['icp']
    let identity: IdentityEx | null
    identity = await loadMyIdentity()
    if (!identity) {
      identity = await loadIdentity(authClient)
    } else {
      // verify wallet connection
      const ok = await AuthStore.#checkIdentity(identity)
      if (!ok) {
        console.warn('Stored identity does not match connected wallet')
        identity = null
      } else {
        supportNetworks = [...fullSupportNetworks]
      }
    }

    if (identity) {
      AuthStore.#login(identity, supportNetworks)
    }
  }

  static #login(identity: IdentityEx, supportNetworks: string[] = ['icp']) {
    identity.expiredHook = () => authStore.logout()
    dynAgent.setIdentity(identity)
    paymentStore.setIdentity(identity)
    authStore.#identity = identity
    authStore.#supportNetworks = supportNetworks
  }

  static async #checkIdentity(identity: IdentityEx) {
    // verify wallet connection
    const { addresses } = await phantomSdk.connect({
      provider: 'injected'
    })
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

  #identity = $state<IdentityEx>(anonymousIdentity)
  #supportNetworks = $state<string[]>([...fullSupportNetworks])

  get backedBy() {
    return this.#identity.backedBy
  }

  get identity() {
    return this.#identity
  }

  get supportNetworks() {
    return this.#supportNetworks
  }

  signIn(identityProvider = IDENTITY_PROVIDER) {
    return new Promise<void>(async (resolve, reject) => {
      // Important: authClientPromise should be resolved here
      // https://ffan0811.medium.com/window-open-returns-null-in-safari-and-firefox-after-allowing-pop-up-on-the-browser-4e4e45e7d926
      const authClient = await authClientPromise
      await authClient.login({
        maxTimeToLive: BigInt(EXPIRATION_MS) * 1000000n,
        identityProvider,
        onSuccess: (msg) => {
          const authnMethod = msg.authnMethod
          const authnOrigin = location.origin
          console.log(
            `Login successful using ${authnMethod} from ${authnOrigin}`
          )

          const identity = new IdentityEx(
            authClient.getIdentity(),
            Date.now() + EXPIRATION_MS
          )

          AuthStore.#login(identity, ['icp'])
          resolve()
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
    })
  }

  signInWithPhantom() {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const { addresses } = await phantomSdk.connect({
          provider: 'injected'
        })
        if (addresses.length === 0) {
          throw new Error('No addresses returned from Phantom wallet')
        }

        const { addressType, address } = addresses[0]!
        const sessionKey = Ed25519KeyIdentity.generate()
        const sessionPubkey = new Uint8Array(
          (sessionKey.getPublicKey() as Ed25519PublicKey).toDer()
        )
        const nowMs = BigInt(Date.now())
        let res: SignInResponse
        let svmAddress: string = ''
        let evmAddress: string = ''
        if (addressType == AddressType.solana) {
          svmAddress = address
          if (
            addresses[1] &&
            addresses[1]!.addressType == AddressType.ethereum
          ) {
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
          res = await signInAPI.signInWithSolana(
            DOMAIN,
            address,
            nowMs,
            message,
            signature,
            sessionPubkey,
            sessionSig
          )
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
          res = await signInAPI.signInWithEthereum(
            DOMAIN,
            address,
            _chainId,
            nowMs,
            message,
            sig,
            sessionPubkey,
            sessionSig
          )
        } else {
          throw new Error(`Unsupported address type: ${addressType}`)
        }

        const signedDelegation = await signInAPI.getDelegation(
          res.seed as Uint8Array,
          sessionPubkey,
          res.expiration
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
            res.user_key,
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
        AuthStore.#login(identity, [...fullSupportNetworks])
        resolve()
      } catch (err: any) {
        console.error('Connect wallet failed:', err, err.data)
        reject(err)
      }
    })
  }

  async logout(url: string = '/app') {
    this.#identity = anonymousIdentity
    this.#supportNetworks = [...fullSupportNetworks]
    dynAgent.setIdentity(anonymousIdentity)
    phantomSdk.disconnect()

    const authClient = await authClientPromise
    await removeMyIdentity()
    await authClient.logout()
    url && window.location.assign(url) // force reload to clear all auth state!!
  }
}

export const authStore = new AuthStore()

AuthStore.init().catch((err) => {
  console.error('Failed to initialize AuthStore', err)
})
