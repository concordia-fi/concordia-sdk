import { AssetID } from './asset'
import { PortfolioID } from './portfolio'

export type TBroker = string

export type Account = {
  account: string
}
export interface IBrokerData {
  assetId: number
  brokerId: number
  availableCoins: number
  basketId: string
  borrowedCoins: number
  interestRateVersion: number
  paramsVersion: number
  tsInterestAccrued: string
  assetType: string
  signerCapAccount: string
}

export type InterestRateParams = {
  u1: number
  u2: number
  r0: number
  r1: number
  r2: number
  r3: number
}
export interface IBroker {
  id: TBroker
  assetId: AssetID

  borrowIX(portfolio: PortfolioID, size: number): object

  repayIX(portfolio: PortfolioID, size: number): object

  lendIX(size: number): object

  redeemIX(size: number): object

  data(): Promise<IBrokerData>
}
