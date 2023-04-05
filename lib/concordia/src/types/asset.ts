export type AssetID = string

export interface IAsset {
  assetId: AssetID
  chainId: string
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
