import { AptosAccount, AptosClient } from 'aptos'
import { AptosFunctionPayload } from 'payload'
import { InterestRateParams, IPrice } from '.'
import { EnvironmentMetadata } from '../environment'
import { BasketID } from './basket'
import { TBroker } from './broker'

export interface IConcordia {
  aptosClient: AptosClient
  environment: EnvironmentMetadata

  ping(): object

  initFrontendContainerIX(tBroker: TBroker): AptosFunctionPayload

  initBaseInfraIX(): AptosFunctionPayload

  initFrontEndIX(tBroker: string): AptosFunctionPayload

  initCollateralManifestIX(): AptosFunctionPayload

  initBasketContainerIX(): AptosFunctionPayload

  initBasketIX(collateralIDs: string[]): AptosFunctionPayload

  insertCollateralIX(
    assetID: number,
    haircutBPS: number,
    maxGlobalDeposit: number,
    maxGlobalDepositUSD: number,
    maxPortfolioDeposit: number,
    maxPortfolioDepositUSD: number
  ): AptosFunctionPayload

  updateBasketIX(basketId: BasketID, add: string[], rm: string[]): AptosFunctionPayload

  initBrokerIX(
    tBroker: TBroker,
    basket: BasketID,
    assetType: string,
    irParams: InterestRateParams
  ): AptosFunctionPayload

  initProfileRegistryIX(): AptosFunctionPayload

  initProfileIX(): AptosFunctionPayload

  initPortfolioRegistryIX(): AptosFunctionPayload

  initPortfolioIX(basketId: BasketID): AptosFunctionPayload

  initProfileAndPortfolioIX(basketId: BasketID): AptosFunctionPayload

  initAssetRegistryIX(): AptosFunctionPayload

  registerAssetIX(
    assetId: number,
    chainId: number,
    precision: number,
    assetType: string
  ): AptosFunctionPayload

  addCollateralIX(portfolioAddress: string, amount: number, coin: string): AptosFunctionPayload

  removeCollateralIX(
    portfolioAddress: string,
    amount: number,
    oracle: number[],
    coin: string
  ): AptosFunctionPayload

  lendIX(tBroker: TBroker, coin: string, amount: number): AptosFunctionPayload

  redeemIX(tBroker: TBroker, coin: string, amount: number): AptosFunctionPayload

  initPriceUpdaterIX(priceSignerKey: Uint8Array): AptosFunctionPayload

  initPriceStoreIX(): AptosFunctionPayload

  bcsSerializeUint256(value: bigint | number): Uint8Array

  encodePrice(price: IPrice): Uint8Array

  encodeAndSignPrices(account: AptosAccount, prices: IPrice[]): Uint8Array

  updatePricesIX(prices: Uint8Array): AptosFunctionPayload
}
