import { AssetID } from './asset'

export type CollateralID = string

export interface ICollateral {
  assetId: AssetID
  haircutBps: number
  maxGlobalDepositUsd: number
  maxGlobalDeposit: number
  maxPortfolioDepositUsd: number
  maxPortfolioDeposit: number
}

export interface IManifest {
  highestID: string
  handle: string
}
