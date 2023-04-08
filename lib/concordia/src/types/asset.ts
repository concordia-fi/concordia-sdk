export type AssetID = number

export interface IAsset {
  assetId: AssetID
  chainId: number
  decimals: number
  logo: string
  description: string
  type: string
}

export interface IAssetRegistry {
  idToInfoHandle: string
  typeToIdHandle: string
  totalAssets: number
}
