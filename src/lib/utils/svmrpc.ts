import {
  type PaymentPayload,
  type PaymentRequirements,
  type SvmPayload
} from '$lib/types/pay'
import {
  address,
  createSolanaRpc,
  devnet,
  fetchEncodedAccount,
  getAddressEncoder,
  getProgramDerivedAddress,
  mainnet,
  type Address,
  type Base64EncodedWireTransaction,
  type Blockhash,
  type Signature
} from '@solana/kit'
import {
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction
} from '@solana/spl-token'
import {
  ComputeBudgetProgram,
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
  type Transaction
} from '@solana/web3.js'

const addressEncoder = getAddressEncoder()

export interface SvmSigner {
  signTransaction(
    transaction: VersionedTransaction | Transaction
  ): Promise<VersionedTransaction | Transaction>
}

export class SvmRpc {
  #providers: string[]
  #devnet = false
  #rpc

  constructor(providers: string[], isDev = false) {
    this.#providers = providers
    this.#devnet = isDev
    this.#rpc = createSolanaRpc(
      isDev ? devnet(providers[0] as string) : mainnet(providers[0] as string)
    )
  }

  async selectProvider() {
    let selected = await Promise.any(
      this.#providers.map(async (url) => {
        const rpc = createSolanaRpc(this.#devnet ? devnet(url) : mainnet(url))
        await rpc.getLatestBlockhash().send()
        return rpc
      })
    )
    this.#rpc = selected
  }

  async getLatestBlockhash(): Promise<Blockhash> {
    const { value } = await this.#rpc.getLatestBlockhash().send()
    return value.blockhash
  }

  async getBalance(addr: string): Promise<bigint> {
    try {
      const { value } = await this.#rpc.getBalance(address(addr)).send()
      return BigInt(value)
    } catch (e) {
      console.warn('Error fetching SOL balance for', addr, ':', e)
      return 0n
    }
  }

  async getAssociatedTokenAddress(
    mint: string,
    addr: string,
    programId: string
  ): Promise<Address> {
    const [pda, _] = await getProgramDerivedAddress({
      programAddress: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL' as Address,
      seeds: [
        // Owner
        addressEncoder.encode(addr as Address),
        // Token program
        addressEncoder.encode(programId as Address),
        // Mint
        addressEncoder.encode(mint as Address)
      ]
    })
    return pda
  }

  async getSplBalance(
    mint: string,
    addr: string,
    programId: string
  ): Promise<bigint> {
    const address = await this.getAssociatedTokenAddress(mint, addr, programId)
    try {
      const { value } = await this.#rpc.getTokenAccountBalance(address).send()
      return BigInt(value.amount)
    } catch (e) {
      console.warn('Error fetching SPL balance for', addr, ':', e)
      return 0n
    }
  }

  // 'processed', 'confirmed', 'finalized', ''
  async getTransactionStatus(sig: string): Promise<string> {
    const { value } = await this.#rpc
      .getSignatureStatuses([sig as Signature])
      .send()
    return value?.[0]?.confirmationStatus || ''
  }

  async sendRawTransaction(signedTx: string): Promise<string> {
    const rt = await this.#rpc
      .sendTransaction(signedTx as Base64EncodedWireTransaction, {
        encoding: 'base64'
      })
      .send()
    return rt
  }

  async createAndSignPayment(
    signer: SvmSigner,
    payer: string,
    x402Version: number,
    paymentRequirements: PaymentRequirements,
    decimals: number,
    programAddress: string
  ): Promise<PaymentPayload<SvmPayload>> {
    const transactionMessage = await this.#createTransferTransactionMessage(
      payer,
      paymentRequirements,
      decimals,
      programAddress
    )
    const transaction = new VersionedTransaction(
      transactionMessage.compileToV0Message()
    )
    const signedTransaction = await signer.signTransaction(transaction)
    const bytes = signedTransaction.serialize({ requireAllSignatures: false })
    // encode signed transaction to base64
    const base64EncodedWireTransaction = Buffer.from(bytes).toString('base64')

    // return payment payload
    return {
      x402Version: x402Version,
      scheme: paymentRequirements.scheme,
      network: paymentRequirements.network,
      payload: {
        transaction: base64EncodedWireTransaction
      }
    }
  }

  async #createTransferTransactionMessage(
    payer: string,
    paymentRequirements: PaymentRequirements,
    decimals: number,
    programAddress: string
  ) {
    // create the transfer instruction
    const instructions = await this.#createAtaAndTransferInstructions(
      payer,
      paymentRequirements,
      decimals,
      programAddress
    )

    // create tx to simulate
    const feePayer = (paymentRequirements.extra as any)?.feePayer
    const { value: latestBlockhash } = await this.#rpc
      .getLatestBlockhash()
      .send()

    return new TransactionMessage({
      payerKey: new PublicKey(feePayer),
      recentBlockhash: latestBlockhash.blockhash,
      instructions
    })
  }

  async #createAtaAndTransferInstructions(
    payer: string,
    paymentRequirements: PaymentRequirements,
    decimals: number,
    tokenProgramAddress: string
  ): Promise<TransactionInstruction[]> {
    const { asset, payTo, extra, maxAmountRequired } = paymentRequirements
    const feePayer = (extra as any)?.feePayer as Address
    // feePayer is required
    if (!feePayer) {
      throw new Error(
        'feePayer is required in paymentRequirements.extra in order to set the ' +
          'facilitator as the fee payer for the create associated token account instruction'
      )
    }

    const instructions: TransactionInstruction[] = []
    // The facilitator REQUIRES ComputeBudget instructions in positions 0 and 1
    instructions.push(
      ComputeBudgetProgram.setComputeUnitLimit({
        units: 40_000 // Sufficient for SPL token transfer + ATA creation
      })
    )

    instructions.push(
      ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 1 // Minimal price
      })
    )

    const sourceATA = await this.getAssociatedTokenAddress(
      asset,
      payer,
      tokenProgramAddress
    )

    // derive the ATA of the payTo address
    const destinationATA = await this.getAssociatedTokenAddress(
      asset,
      payTo,
      tokenProgramAddress
    )

    // create the ATA (if needed)
    const maybeAccount = await fetchEncodedAccount(this.#rpc, destinationATA)
    // if the ATA does not exist, return an instruction to create it
    if (!maybeAccount.exists) {
      instructions.push(
        createAssociatedTokenAccountInstruction(
          new PublicKey(feePayer),
          new PublicKey(destinationATA),
          new PublicKey(payTo),
          new PublicKey(asset),
          new PublicKey(tokenProgramAddress)
        )
      )
    }

    instructions.push(
      createTransferCheckedInstruction(
        new PublicKey(sourceATA),
        new PublicKey(asset),
        new PublicKey(destinationATA),
        new PublicKey(payer),
        BigInt(maxAmountRequired),
        decimals,
        [],
        new PublicKey(tokenProgramAddress)
      )
    )

    return instructions
  }
}
