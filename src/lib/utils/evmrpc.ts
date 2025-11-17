import {
  type EvmPayload,
  type PaymentPayload,
  type PaymentRequirements
} from '$lib/types/pay'
import { bytesToHex, randomBytes } from '@noble/hashes/utils'
import { createRequest, JSON_MIME_TYPE } from './fetcher'

/// EIP3009
export const authorizationTypes = {
  EIP712Domain: [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'verifyingContract', type: 'address' }
  ],
  TransferWithAuthorization: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'validAfter', type: 'uint256' },
    { name: 'validBefore', type: 'uint256' },
    { name: 'nonce', type: 'bytes32' }
  ]
}

export const authorizationPrimaryType = 'TransferWithAuthorization'

export interface EvmSigner {
  signTypedData(typedData: any, address: string): Promise<string>
}

export class EvmRpc {
  #providers: string[]
  #endpoint: string

  constructor(providers: string[]) {
    this.#providers = providers
    this.#endpoint = providers[0] as string
  }

  async selectProvider() {
    let selected = await Promise.any(
      this.#providers.map(async (url) => {
        await jsonRPC<string>(url, 'eth_chainId', [])
        return url
      })
    )
    this.#endpoint = selected
  }

  async chainId(): Promise<number> {
    const rt =
      (await jsonRPC<string>(this.#endpoint, 'eth_chainId', [])) || '0x0'
    return parseInt(rt.slice(2), 16)
  }

  async gasPrice(): Promise<bigint> {
    const rt =
      (await jsonRPC<string>(this.#endpoint, 'eth_gasPrice', [])) || '0x0'
    return BigInt(rt)
  }

  async maxPriorityFeePerGas(): Promise<bigint> {
    const rt =
      (await jsonRPC<string>(this.#endpoint, 'eth_maxPriorityFeePerGas', [])) ||
      '0x0'
    return BigInt(rt)
  }

  async gasFeeEstimation(gas: bigint = 54000n): Promise<bigint> {
    const [gasPrice, maxPriorityFeePerGas] = await Promise.all([
      this.gasPrice(),
      this.maxPriorityFeePerGas()
    ])
    return gas * (gasPrice + maxPriorityFeePerGas)
  }

  async blockNumber(): Promise<number> {
    const rt =
      (await jsonRPC<string>(this.#endpoint, 'eth_blockNumber', [])) || '0x0'
    return parseInt(rt.slice(2), 16)
  }

  async getBalance(address: string): Promise<bigint> {
    const rt =
      (await jsonRPC<string>(this.#endpoint, 'eth_getBalance', [
        address,
        'latest'
      ])) || '0x0'
    return BigInt(rt)
  }

  async getErc20Balance(address: string, contract: string): Promise<bigint> {
    const data =
      '0x70a08231000000000000000000000000' +
      address.toLowerCase().replace(/^0x/, '')
    const rt =
      (await jsonRPC<string>(this.#endpoint, 'eth_call', [
        {
          to: contract,
          data: data
        },
        'latest'
      ])) || '0x0'
    return BigInt(rt)
  }

  async getTransactionReceipt(txHash: string): Promise<any> {
    const rt =
      (await jsonRPC<any>(this.#endpoint, 'eth_getTransactionReceipt', [
        txHash
      ])) || null
    return rt
  }

  async sendRawTransaction(signedTx: string): Promise<string> {
    const rt =
      (await jsonRPC<string>(this.#endpoint, 'eth_sendRawTransaction', [
        signedTx
      ])) || '0x'
    return rt
  }

  async createAndSignPayment(
    signer: EvmSigner,
    payer: string,
    x402Version: number,
    paymentRequirements: PaymentRequirements,
    chainId: number
  ): Promise<PaymentPayload<EvmPayload>> {
    const paymentPayload = this.#createTransferWithAuthorizationMessage(
      payer,
      x402Version,
      paymentRequirements
    )
    const {
      asset,
      extra
    }: { asset: string; extra?: { name?: string; version?: string } } =
      paymentRequirements
    const name = extra?.name
    const version = extra?.version

    const data = {
      types: authorizationTypes,
      domain: {
        name,
        version,
        chainId,
        verifyingContract: asset
      },
      primaryType: authorizationPrimaryType,
      message: paymentPayload.payload.authorization
    }

    paymentPayload.payload.signature = await signer.signTypedData(data, payer)
    return paymentPayload
  }

  #createTransferWithAuthorizationMessage(
    payer: string,
    x402Version: number,
    paymentRequirements: PaymentRequirements
  ): PaymentPayload<EvmPayload> {
    const nonce = '0x' + bytesToHex(randomBytes(32))
    const validAfter = BigInt(
      Math.floor(Date.now() / 1000) - 600 // 10 minutes before
    ).toString()
    const validBefore = BigInt(
      Math.floor(Date.now() / 1000 + paymentRequirements.maxTimeoutSeconds)
    ).toString()

    return {
      x402Version,
      scheme: paymentRequirements.scheme,
      network: paymentRequirements.network,
      payload: {
        signature: '',
        authorization: {
          from: payer,
          to: paymentRequirements.payTo,
          value: paymentRequirements.maxAmountRequired,
          validAfter: validAfter.toString(),
          validBefore: validBefore.toString(),
          nonce
        }
      }
    }
  }
}

export async function jsonRPC<T>(
  url: string,
  method: string,
  params: unknown[] = [],
  signal?: AbortSignal | null | undefined
): Promise<T | null> {
  const request = createRequest(url, {
    headers: {
      'Content-Type': JSON_MIME_TYPE
    }
  })

  const body = {
    id: 1,
    jsonrpc: '2.0',
    method,
    params
  }

  const res = await request.post<{
    jsonrpc: string
    result?: T
    error?: { code: number; message: string; data?: unknown }
    id: string | number
  }>(url, body, signal)

  if (res.error) {
    const { code, message, data } = res.error
    const error = new Error(
      `JSON-RPC Error ${code}: ${message}${data ? ` - ${JSON.stringify(data)}` : ''}`
    )
    throw error
  }

  return res.result || null
}
