import { AssetID } from './asset'

export type PortfolioID = string

export type PositionData = {
  keys: number[]
  values: number[]
}

export interface IPositions {
  collaterals: PositionData
  liabilities: PositionData
  vault: string
}

export interface IPortfolioData {
  address: string
  basketId: string
  liabByFrontEnd: PositionData
  positions: IPositions
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
