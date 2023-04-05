export type AssetMetadata = {
  id: number
  blockchain: number
  nativeID: string
  decimals: number
}

export type AssetMetadataCache = Record<number, AssetMetadata>

/**
 * The AssetRegistry class is responsible for mapping numeric asset IDs to their metadata
 * It caches the results of fetches, and delegates to a web database to get information it does not have
 */
export class AssetRegistry {
  constructor(public cache: AssetMetadataCache) {}

  getAsset(id: number): AssetMetadata {
    // TODO - fetch from service if not in cache
    return this.cache[id]
  }
}
