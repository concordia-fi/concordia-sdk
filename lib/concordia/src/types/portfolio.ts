import { AssetID } from './asset'

export type PortfolioID = string

export type PositionData = {
  handle: string
  items: number[]
  keys: {
    itemTableHandle: string
    items: string[]
  }
}

export interface IPortfolioData {
  address: string
  basketId: string
  liabByFrontEnd: PositionData
  positions: {
    collaterals: PositionData
    liabilities: PositionData
    vault: string
  }
  ra: string
}

export interface IPortfolio {
  id: PortfolioID

  addCollateralIX(asset: AssetID, size: number): object

  withdrawCollateralIX(asset: AssetID, size: number): object

  data(): Promise<IPortfolioData>
}

export interface IPortfolioRegistry {
  allAddresses: string[]
  keyToAddressHandle: string
}

export interface ICounter {
  counter: string
  guid: object
}
export interface INote {
  type: string
  value: number
  depositEvents: ICounter
  frozen: boolean
  withdrawEvents: ICounter
}
