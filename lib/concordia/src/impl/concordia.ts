import { EnvironmentMetadata } from '../environment'
import { BasketID, TBroker, IConcordia, IPrice, InterestRateParams } from '../types'
import { AptosClient, AptosAccount, BCS } from 'aptos'
import { AssetRegistry } from '../asset/assetRegistry'
import { mockCache } from '../asset/mock'
import { Fetcher } from '../io'
import { AptosFunctionPayload } from 'payload'

export const CONCORDIA_TESTNET_ADDRESS = '60d261da43a7045674a77a2c9a8a0167fe42cd6d79f62a2cf6254199d48719e2'

export class Concordia implements IConcordia {
  assetRegistry: AssetRegistry
  fetcher: Fetcher

  constructor(public aptosClient: AptosClient, public environment: EnvironmentMetadata) {
    this.assetRegistry = new AssetRegistry(mockCache)
    this.fetcher = new Fetcher(aptosClient, environment.aptosAddress)
  }

  private aptosEntryID(fn: string, module = 'entry') {
    return `0x${this.environment.aptosAddress}::${module}::${fn}`
  }

  private aptosAdminEntryID(fn: string) {
    return this.aptosEntryID(fn, 'entry_admin')
  }

  ping(): AptosFunctionPayload {
    return {
      type: 'entry_function_payload',
      function: this.aptosEntryID('ping'),
      arguments: [],
      type_arguments: []
    }
  }

  async allResources() {
    const resources = await this.aptosClient.getAccountResources(this.environment.aptosAddress)
    return resources
  }

  initBaseInfraIX(): AptosFunctionPayload {
    return {
      type: 'entry_function_payload',
      function: this.aptosAdminEntryID('setup'),
      arguments: [],
      type_arguments: []
    }
  }

  initFrontendContainerIX(tBroker: TBroker): AptosFunctionPayload {
    return {
      type: 'entry_function_payload',
      function: this.aptosAdminEntryID('init_frontend_container'),
      arguments: [],
      type_arguments: [tBroker]
    }
  }

  initFrontEndIX(tBroker: TBroker): AptosFunctionPayload {
    return {
      type: 'entry_function_payload',
      function: this.aptosEntryID('init_frontend', 'entry'),
      arguments: [],
      type_arguments: [tBroker]
    }
  }

  initCollateralManifestIX(): AptosFunctionPayload {
    return {
      type: 'entry_function_payload',
      function: this.aptosAdminEntryID('init_collateral_manifest'),
      type_arguments: [],
      arguments: []
    }
  }

  initBasketContainerIX(): AptosFunctionPayload {
    return {
      type: 'entry_function_payload',
      function: this.aptosAdminEntryID('init_basket_container'),
      arguments: [],
      type_arguments: []
    }
  }

  initBasketIX(eligibleIds: string[]): AptosFunctionPayload {
    return {
      type: 'entry_function_payload',
      function: this.aptosAdminEntryID('init_basket'),
      arguments: [eligibleIds],
      type_arguments: []
    }
  }

  initPriceUpdaterIX(priceSignerKey: Uint8Array): AptosFunctionPayload {
    return {
      type: 'entry_function_payload',
      function: this.aptosAdminEntryID('init_price_updater'),
      arguments: [priceSignerKey],
      type_arguments: []
    }
  }

  initPriceStoreIX(): AptosFunctionPayload {
    return {
      type: 'entry_function_payload',
      function: this.aptosAdminEntryID('init_price_store'),
      arguments: [],
      type_arguments: []
    }
  }

  bcsSerializeUint256(value: bigint | number): Uint8Array {
    const serializer = new BCS.Serializer()
    serializer.serializeU256(value)
    return serializer.getBytes()
  }

  encodePrice(price: IPrice): Uint8Array {
    return new Uint8Array([
      ...BCS.bcsSerializeUint64(price.assetId).reverse(),
      ...this.bcsSerializeUint256(price.confidence).reverse(),
      ...this.bcsSerializeUint256(price.price).reverse(),
      ...BCS.bcsSerializeUint64(price.publishTime).reverse()
    ])
  }

  encodeAndSignPrices(account: AptosAccount, prices: IPrice[]): Uint8Array {
    const payloadType = 0 // 0 = price update
    // BCS encodes in little endian. Concordia
    // uses big endian. So reverse the results.
    let body = new Uint8Array([
      ...BCS.bcsSerializeUint64(payloadType).reverse(),
      ...BCS.bcsSerializeUint64(Date.now()).reverse(),
      ...BCS.bcsSerializeUint64(prices.length).reverse()
    ])
    for (const price of prices) {
      body = new Uint8Array([...body, ...this.encodePrice(price)])
    }
    const signature = account.signBuffer(body).toUint8Array()
    return new Uint8Array([...signature, ...body])
  }

  bcsDeserializeUint256(bytes: Uint8Array): bigint {
    const deserializer = new BCS.Deserializer(bytes)
    return deserializer.deserializeU256()
  }

  decodePrice(bytes: Uint8Array): IPrice {
    const deserializer = new BCS.Deserializer(bytes.reverse())
    //reverse order because BCS is little endian
    const startPrice = 8
    const startConfidence = startPrice + 32
    const publishTime = Number(deserializer.deserializeU64())
    const price = this.bcsDeserializeUint256(bytes.slice(startPrice, startConfidence))
    const confidence = this.bcsDeserializeUint256(
      bytes.slice(startConfidence, startConfidence + 32)
    )
    const assetIdStart = startConfidence + 32
    const assetDeserializer = new BCS.Deserializer(bytes.slice(assetIdStart, assetIdStart + 8))
    const assetId = Number(assetDeserializer.deserializeU64())
    return {
      assetId,
      publishTime,
      confidence,
      price
    }
  }

  decodeHeader(bytes: Uint8Array): { payloadType: number; timestamp: number; numPrices: number } {
    if (bytes.length != 24) {
      throw new Error('Invalid price payload')
    }
    const deserializer = new BCS.Deserializer(bytes.reverse())
    //reverse order because BCS is little endian
    const numPrices = Number(deserializer.deserializeU64())
    const timestamp = Number(deserializer.deserializeU64())
    const payloadType = Number(deserializer.deserializeU64())
    return {
      payloadType,
      timestamp,
      numPrices
    }
  }

  /**
   * decodes price payload
   * @param bytes
   * @returns
   */
  decodePrices(bytes: Uint8Array): IPrice[] {
    const singlePriceSize = 8 + 32 + 32 + 8
    const _signature = bytes.slice(0, 64)
    const header = this.decodeHeader(bytes.slice(64, 88))
    if (header.payloadType !== 0) {
      throw new Error(`Invalid payload type: ${header.payloadType}`)
    }
    const now = Date.now()
    if (now - header.timestamp > 300000 /* 5 minutes */) {
      throw new Error(`Timestamp is older than 5 minutes: ${header.timestamp}`)
    }
    const body = bytes.slice(88)
    const prices: IPrice[] = []
    for (let i = 0; i < header.numPrices * singlePriceSize; i += singlePriceSize) {
      prices.push(this.decodePrice(body.slice(i, i + singlePriceSize)))
    }
    return prices
  }

  updatePricesIX(prices: Uint8Array): AptosFunctionPayload {
    return {
      type: 'entry_function_payload',
      function: this.aptosEntryID('update_prices'),
      arguments: [prices],
      type_arguments: []
    }
  }

  insertCollateralIX(
    assetId: number,
    haircutBps: number,
    maxGlobalDeposit: number,
    maxGlobalDepositUSD: number,
    maxPortfolioDeposit: number,
    maxPortfolioDepositUSD: number
  ): AptosFunctionPayload {
    return {
      type: 'entry_function_payload',
      function: this.aptosAdminEntryID('insert_collateral'),
      arguments: [
        assetId,
        haircutBps,
        maxGlobalDeposit,
        maxGlobalDepositUSD,
        maxPortfolioDeposit,
        maxPortfolioDepositUSD
      ],
      type_arguments: []
    }
  }

  insertCollateralWithNewPriceIX(
    assetId: number,
    haircutBps: number,
    maxGlobalDeposit: number,
    maxGlobalDepositUSD: number,
    maxPortfolioDeposit: number,
    maxPortfolioDepositUSD: number,
    oracle: Uint8Array
  ): AptosFunctionPayload {
    return {
      type: 'entry_function_payload',
      function: this.aptosAdminEntryID('insert_collateral_with_new_price'),
      arguments: [
        assetId,
        haircutBps,
        maxGlobalDeposit,
        maxGlobalDepositUSD,
        maxPortfolioDeposit,
        maxPortfolioDepositUSD,
        oracle
      ],
      type_arguments: []
    }
  }

  updateBasketIX(basketId: BasketID, add: string[], rm: string[]): AptosFunctionPayload {
    return {
      type: 'entry_function_payload',
      function: this.aptosAdminEntryID('update_basket'),
      arguments: [basketId, add, rm],
      type_arguments: []
    }
  }

  initBrokerIX(
    tBroker: TBroker,
    basket: BasketID,
    assetType: string,
    irParams: InterestRateParams,
    depositNoteAssetId: number,
    loanNoteAssetId: number,
  ): AptosFunctionPayload {
    const { u1, u2, r0, r1, r2, r3 } = irParams
    return {
      type: 'entry_function_payload',
      function: this.aptosAdminEntryID('init_broker'),
      arguments: [basket, u1, u2, r0, r1, r2, r3, depositNoteAssetId, loanNoteAssetId],
      type_arguments: [tBroker, assetType]
    }
  }

  initBrokerRegistryIX(): AptosFunctionPayload {
    return {
      type: 'entry_function_payload',
      function: this.aptosAdminEntryID('init_broker_registry'),
      arguments: [],
      type_arguments: []
    }
  }

  initProfileRegistryIX(): AptosFunctionPayload {
    return {
      type: 'entry_function_payload',
      function: this.aptosAdminEntryID('init_profile_registry'),
      arguments: [],
      type_arguments: []
    }
  }

  initProfileIX(): AptosFunctionPayload {
    return {
      type: 'entry_function_payload',
      function: this.aptosEntryID('init_profile', 'entry'),
      arguments: [],
      type_arguments: []
    }
  }

  initPortfolioRegistryIX(): AptosFunctionPayload {
    return {
      type: 'entry_function_payload',
      function: this.aptosAdminEntryID('init_portfolio_registry'),
      arguments: [],
      type_arguments: []
    }
  }

  initPortfolioIX(basketId: BasketID): AptosFunctionPayload {
    return {
      type: 'entry_function_payload',
      function: this.aptosEntryID('init_portfolio', 'entry'),
      arguments: [basketId],
      type_arguments: []
    }
  }

  initProfileAndPortfolioIX(basketId: BasketID): AptosFunctionPayload {
    return {
      type: 'entry_function_payload',
      function: this.aptosEntryID('init_profile_and_portfolio', 'entry'),
      arguments: [basketId],
      type_arguments: []
    }
  }

  addCollateralIX(portfolioAddress: string, amount: number, coin: string): AptosFunctionPayload {
    return {
      type: 'entry_function_payload',
      function: this.aptosEntryID('add_collateral', 'entry'),
      arguments: [portfolioAddress, amount],
      type_arguments: [coin]
    }
  }

  removeCollateralIX(
    portfolioAddress: string,
    amount: number,
    oracle: number[],
    coin: string
  ): AptosFunctionPayload {
    return {
      type: 'entry_function_payload',
      function: this.aptosEntryID('remove_collateral', 'entry'),
      arguments: [portfolioAddress, amount, oracle],
      type_arguments: [coin]
    }
  }

  lendIX(tBroker: TBroker, coin: string, amount: number): AptosFunctionPayload {
    return {
      type: 'entry_function_payload',
      function: this.aptosEntryID('lend', 'entry'),
      arguments: [amount],
      type_arguments: [tBroker, coin]
    }
  }

  redeemIX(tBroker: TBroker, coin: string, amount: number): AptosFunctionPayload {
    return {
      type: 'entry_function_payload',
      function: this.aptosEntryID('redeem', 'entry'),
      arguments: [amount],
      type_arguments: [tBroker, coin]
    }
  }

  initAssetRegistryIX(): AptosFunctionPayload {
    return {
      type: 'entry_function_payload',
      function: this.aptosAdminEntryID('init_asset_registry'),
      arguments: [],
      type_arguments: []
    }
  }

  registerAssetIX(
    assetId: number,
    chainId: number,
    precision: number,
    assetType: string
  ): AptosFunctionPayload {
    return {
      type: 'entry_function_payload',
      function: this.aptosAdminEntryID('register_asset'),
      arguments: [assetId, chainId, precision],
      type_arguments: [assetType]
    }
  }

  borrowIX(
    portfolioAddress: string,
    frontEndId: string,
    amount: number,
    oracle: Uint8Array,
    tBroker: string,
    coin: string
  ): AptosFunctionPayload {
    return {
      type: 'entry_function_payload',
      function: this.aptosEntryID('borrow', 'entry'),
      arguments: [portfolioAddress, frontEndId, amount, oracle],
      type_arguments: [tBroker, coin]
    }
  }

  repayWithCoinsIX(
    portfolioAddress: string,
    frontEndId: string,
    amount: number,
    tBroker: string,
    coin: string
  ): AptosFunctionPayload {
    return {
      type: 'entry_function_payload',
      function: this.aptosEntryID('repay_with_coins', 'entry'),
      arguments: [portfolioAddress, frontEndId, amount],
      type_arguments: [tBroker, coin]
    }
  }

  repayWithCollateralizedCoinsIX(
    portfolioAddress: string,
    frontEndId: string,
    amount: number,
    oracle: Uint8Array,
    tBroker: string,
    coin: string
  ): AptosFunctionPayload {
    return {
      type: 'entry_function_payload',
      function: this.aptosEntryID('repay_with_collateralized_coins', 'entry'),
      arguments: [portfolioAddress, frontEndId, amount, oracle],
      type_arguments: [tBroker, coin]
    }
  }

  repayWithDepositNotesIX(
    portfolioAddress: string,
    frontEndId: string,
    noteAmount: number,
    tBroker: string
  ): AptosFunctionPayload {
    return {
      type: 'entry_function_payload',
      function: this.aptosEntryID('repay_with_deposit_notes', 'entry'),
      arguments: [portfolioAddress, frontEndId, noteAmount],
      type_arguments: [tBroker]
    }
  }

  repayWithCollateralizedDepositNotesIX(
    portfolioAddress: string,
    frontEndId: string,
    amountUnderlying: number,
    oracle: Uint8Array,
    tBroker: string,
    coin: string
  ): AptosFunctionPayload {
    return {
      type: 'entry_function_payload',
      function: this.aptosEntryID('repay_with_collateralized_deposit_notes', 'entry'),
      arguments: [portfolioAddress, frontEndId, amountUnderlying, oracle],
      type_arguments: [tBroker, coin]
    }
  }
}
