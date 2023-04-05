import { AssetID } from './asset'

export interface IPosition {
  asset: AssetID
  size: number

  /**
   * Calculate USD value of position
   */
  usd(): Promise<number>
}
