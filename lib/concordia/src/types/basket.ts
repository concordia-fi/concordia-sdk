import { CollateralID } from './collateral'

export type BasketID = string

export interface IBasket {
  basketId: BasketID
  items: CollateralID[]
}

export interface IBasketContainer {
  highestID: string
  handle: string
}
