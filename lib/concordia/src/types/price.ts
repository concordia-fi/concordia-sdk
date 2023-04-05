export interface IPrice {
  assetId: number
  publishTime: number
  price: bigint
  confidence: bigint
}

export interface IPriceStore {
  assetIdToPriceHandle: string
}
