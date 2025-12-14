import { TokenLedgerAPI } from '$lib/canisters/tokenledger'
import { ANDA_X402_CANISTER_ID } from '$lib/constants'
import {
  type PaymentLog,
  type TransactionResult,
  type UserProfile
} from '$lib/types/pay'
import { errMessage } from '$lib/types/result'
import { IdentityEx, anonymousIdentity } from '$lib/utils/auth'
import { EvmRpc } from '$lib/utils/evmrpc'
import { PaymentInfo } from '$lib/utils/payment.svelte'
import { SvmRpc } from '$lib/utils/svmrpc'
import { type TokenInfo } from '$lib/utils/token'
import { SignIdentity } from '@dfinity/agent'
import { type DelegationIdentity } from '@dfinity/identity'
import { Principal } from '@dfinity/principal'
import { X402Canister } from '@ldclabs/anda_x402'
import {
  bytesToBase64Url,
  deterministicEncode,
  signMessage
} from '@ldclabs/ic-auth'
import { authStore, getPaymentToken, setPaymentToken } from './auth.svelte'
import { type VersionedTransaction } from '@solana/web3.js'
import { type PaymentRequirements } from '@ldclabs/1paying-kit'

const API_ENDPOINT = 'https://api.1pay.ing'

interface AuthorizationRequest {
  message: AuthorizationMessage // 1Paying client session delegation
  signature: string // ICP style signed envelope encoded as base64 string
}

interface AuthorizationMessage {
  expiration: number // expiration time as unix timestamp in seconds
  audience?: string
  notBefore?: number
}

export const EventReady = 'Ready'

class PaymentStore extends EventTarget {
  #identity: IdentityEx
  #icpAPI: Record<string, TokenLedgerAPI>
  #svmRpc: SvmRpc
  #svmdevRpc: SvmRpc
  #baseRpc: EvmRpc
  #baseSepoliaRpc: EvmRpc
  #icpX402: X402Canister | null = null
  #txsCwt: string = ''
  #cwtExpiresAt: number = 0 // in milliseconds
  #refreshingTxsCwt: boolean = false

  constructor() {
    super()
    this.#identity = anonymousIdentity
    this.#icpAPI = {}
    this.#svmRpc = new SvmRpc([
      'https://solana-mainnet.g.alchemy.com/v2/kSUUF5j-oOY3j6Cszdi4X'
    ])
    this.#svmdevRpc = new SvmRpc(
      ['https://solana-devnet.g.alchemy.com/v2/kSUUF5j-oOY3j6Cszdi4X'],
      true
    )
    this.#baseRpc = new EvmRpc([
      'https://base-mainnet.g.alchemy.com/v2/kSUUF5j-oOY3j6Cszdi4X'
    ])
    this.#baseSepoliaRpc = new EvmRpc([
      'https://base-sepolia.g.alchemy.com/v2/kSUUF5j-oOY3j6Cszdi4X'
    ])
  }

  async init() {
    await await new Promise((resolve) => setTimeout(resolve, 1000))
    await this.#svmRpc.selectProvider()
    await this.#svmdevRpc.selectProvider()
    await this.#baseRpc.selectProvider()
    await this.#baseSepoliaRpc.selectProvider()
  }

  setIdentity(identity: IdentityEx) {
    this.#icpX402 = null
    this.#txsCwt = ''
    this.#cwtExpiresAt = 0
    this.#identity = identity
    if (identity.isAuthenticated) {
      this.#icpX402 = new X402Canister(
        ANDA_X402_CANISTER_ID,
        identity.id as any as SignIdentity
      )

      getPaymentToken().then(async (auth) => {
        if (auth && auth.id === identity.getPrincipal().toText()) {
          this.#txsCwt = auth.token
          this.#cwtExpiresAt = auth.expiresAt
          if (Date.now() < this.#cwtExpiresAt) {
            this.dispatchEvent(new Event(EventReady))
          }
        }
        await this.tryRefreshTxsCwt()
        // const profile = await this.getProfile()
        // console.log('User profile:', profile)
      })
    }
  }

  async getBalance(
    token: TokenInfo & { programId?: string },
    address: string
  ): Promise<bigint> {
    switch (token.network) {
      case 'icp':
        let api = this.#icpAPI[token.address]
        if (!api) {
          api = new TokenLedgerAPI(token)
          this.#icpAPI[token.address] = api
        }
        return await api.getBalanceOf(Principal.fromText(address))
      case 'solana':
        if (token.address === 'So11111111111111111111111111111111111111111') {
          // SOL
          return await this.#svmRpc.getBalance(address)
        }

        return await this.#svmRpc.getSplBalance(
          token.address,
          address,
          token.programId!
        )
      case 'solana-devnet':
        if (token.address === 'So11111111111111111111111111111111111111111') {
          // SOL
          return await this.#svmdevRpc.getBalance(address)
        }

        return await this.#svmdevRpc.getSplBalance(
          token.address,
          address,
          token.programId!
        )
      case 'base':
        return await this.#baseRpc.getErc20Balance(address, token.address)
      case 'base-testnet':
        return await this.#baseSepoliaRpc.getErc20Balance(
          address,
          token.address
        )
    }

    throw new Error(`Unsupported network: ${token.network}`)
  }

  buildX402Request(
    info: PaymentInfo,
    solTransaction?: VersionedTransaction
  ): Promise<TransactionResult<string>> {
    let promise: Promise<TransactionResult<string>>
    switch (info.network) {
      case 'icp':
        promise = this.#icpBuildX402Request(info)
        break
      case 'solana':
      case 'solana-devnet':
        promise = this.#solBuildX402Request(info, solTransaction)
        break
      case 'base':
      case 'base-testnet':
        promise = this.#baseBuildX402Request(info)
        break
      default:
        return Promise.resolve({
          status: 'error',
          error: {
            code: 0,
            message: `Unsupported network: ${info.originNetwork}`
          }
        })
    }

    return promise.catch((err) => {
      return {
        status: 'error',
        error: {
          code: 0,
          message: errMessage(err)
        }
      }
    })
  }

  async getProfile(): Promise<UserProfile> {
    const response = await fetch(`${API_ENDPOINT}/my/profile`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.#txsCwt}`
      }
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(
        `Failed to submit transaction: ${response.status}, ${text}`
      )
    }
    const { result }: { result: UserProfile } = await response.json()
    return result
  }

  async listMyHistory(
    cursor?: string
  ): Promise<[PaymentLog[], string | undefined]> {
    if (!this.#txsCwt) {
      return [[], undefined]
    }

    let url = `${API_ENDPOINT}/my/txs?limit=5`
    if (cursor) {
      url += `&cursor=${cursor}`
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.#txsCwt}`
      }
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Failed to list history: ${response.status}, ${text}`)
    }

    const {
      result,
      next_cursor
    }: { result: PaymentLog[]; next_cursor?: string } = await response.json()
    return [result, next_cursor]
  }

  async submitTransaction(
    tx: string,
    state: TransactionResult<string>
  ): Promise<void> {
    await this.tryRefreshTxsCwt()

    const response = await fetch(`${API_ENDPOINT}/tx/${tx}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.#txsCwt}`
      },
      body: JSON.stringify(state)
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(
        `Failed to submit transaction: ${response.status}, ${text}`
      )
    }
  }

  async tryRefreshTxsCwt(depth: number = 0): Promise<void> {
    const hadToken = Boolean(this.#txsCwt)
    if (
      depth === 0 &&
      (Date.now() < this.#cwtExpiresAt - 600000 || this.#refreshingTxsCwt)
    ) {
      return
    }

    if (!this.#identity.isAuthenticated) return

    this.#refreshingTxsCwt = true
    try {
      const message: AuthorizationMessage = {
        expiration: 86400
      }
      const sig = await signMessage(
        this.#identity.id as any as DelegationIdentity,
        message
      )
      delete sig.h // remove 'h' field as it's not needed for verification
      const authReq: AuthorizationRequest = {
        message,
        signature: bytesToBase64Url(deterministicEncode(sig))
      }
      const response = await fetch(`${API_ENDPOINT}/authorize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(authReq)
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(
          `Failed to refresh transaction CWT: ${response.status}, ${text}`
        )
      }

      const { result } = await response.json()
      this.#txsCwt = result.token
      this.#cwtExpiresAt = result.expiresAt

      this.#refreshingTxsCwt = false
      await setPaymentToken({
        id: this.#identity.getPrincipal().toText(),
        token: result.token,
        expiresAt: result.expiresAt
      })

      if (!hadToken && this.#txsCwt) {
        this.dispatchEvent(new Event(EventReady))
      }
    } catch (error) {
      console.error('Error refreshing transaction CWT:', error)
      if (depth >= 10) {
        this.#refreshingTxsCwt = false
        throw new Error('Failed to refresh transaction CWT after 10 attempts')
      }

      await new Promise((resolve) => setTimeout(resolve, 3000))
      await this.tryRefreshTxsCwt(depth + 1)
    }
  }

  async #icpBuildX402Request(
    info: PaymentInfo
  ): Promise<TransactionResult<string>> {
    if (!this.#icpX402) {
      throw new Error('ICP identity is not set')
    }

    const amountToApprove = info.amountRequired + BigInt(info.token?.fee || 0n)
    if (amountToApprove > info.balance) {
      throw new Error('Insufficient balance for payment and fee')
    }

    const x402Request = await this.#icpX402.buildX402Request(
      info.payment as PaymentRequirements,
      info.x402Version
    )
    await this.#icpX402.ensureAllowance(info.payment.asset, amountToApprove)
    return {
      status: 'completed',
      result: info.toPaymentPayloadBase64(x402Request.paymentPayload.payload),
      log: info.toLog(this.#identity.getPrincipal().toText())
    }
  }

  async solBuildX402Transaction(
    info: PaymentInfo
  ): Promise<VersionedTransaction> {
    const rpc =
      info.payment.network === 'solana' ? this.#svmRpc : this.#svmdevRpc
    const signer = authStore.svmSigner
    if (!signer) {
      throw new Error('SVM signer is not available')
    }
    return await rpc.createTransaction(
      this.#identity.svmAddress!,
      info,
      info.token!.decimals,
      info.token!.programId!
    )
  }

  #solBuildX402Request(
    info: PaymentInfo,
    solTransaction?: VersionedTransaction
  ): Promise<TransactionResult<string>> {
    const rpc =
      info.payment.network === 'solana' ? this.#svmRpc : this.#svmdevRpc
    const signer = authStore.svmSigner
    if (!signer) {
      throw new Error('SVM signer is not available')
    }
    const promise = solTransaction
      ? rpc.signPayment(signer, solTransaction)
      : rpc.createAndSignPayment(
          signer,
          this.#identity.svmAddress!,
          info,
          info.token!.decimals,
          info.token!.programId!
        )

    return promise.then((payload) => {
      return {
        status: 'completed',
        result: info.toPaymentPayloadBase64(payload),
        log: info.toLog(this.#identity.svmAddress!)
      }
    })
  }

  async #baseBuildX402Request(
    info: PaymentInfo
  ): Promise<TransactionResult<string>> {
    const rpc =
      info.payment.network === 'base' ? this.#baseRpc : this.#baseSepoliaRpc
    const signer = authStore.evmSigner
    if (!signer) {
      throw new Error('EVM signer is not available')
    }

    const payload = await rpc.createAndSignPayment(
      signer,
      this.#identity.evmAddress!,
      info,
      info.token!.chainId!
    )

    return {
      status: 'completed',
      result: info.toPaymentPayloadBase64(payload),
      log: info.toLog(this.#identity.evmAddress!)
    }
  }
}

export const paymentStore = new PaymentStore()

paymentStore.init().catch((err) => {
  console.error('Failed to initialize payment store:', err)
})
