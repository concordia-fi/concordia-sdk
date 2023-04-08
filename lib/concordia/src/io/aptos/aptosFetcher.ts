import { AptosClient } from 'aptos'
import {
  Asset,
  AssetRegistry,
  Broker,
  Collateral,
  CollateralBasket,
  CollateralBasketContainer,
  CollateralManifest,
  FrontEnd,
  FrontEndContainer,
  PriceData,
  PriceStore,
  Note,
  NoteData,
  Portfolio,
  PortfolioRegistry,
  Profile,
  ProfileRegistry
} from './types'

export class AptosFetcher {
  aptosCache: Record<string, any> = {}

  constructor(public aptosClient: AptosClient, public rootAddress: string) {}

  cacheKey(address: string, resourceType: string): string {
    return `${address}@${resourceType}`
  }

  get rootPrefix() {
    return `0x${this.rootAddress}::`
  }

  private withRoot(t: string) {
    return this.rootPrefix + t
  }

  private async resource<T>(resourceStruct: string, refresh = true): Promise<T> {
    const resourceType = this.withRoot(resourceStruct)
    const k = this.cacheKey(this.rootAddress, resourceType)

    // If a refresh is requested
    // or the cache is missing a value
    // perform IO
    if (refresh || !this.aptosCache[k]) {
      const res = await this.aptosClient.getAccountResource(this.rootAddress, resourceType)
      this.aptosCache[k] = res.data
    }

    return this.aptosCache[k]
  }

  //pass in optional keyType to override u64 (rare case)
  private tableItem(tableHandle: string, key: string, valueType: string, keyType = 'u64') {
    return this.aptosClient.getTableItem(tableHandle, {
      key_type: keyType,
      value_type: valueType,
      key
    })
  }

  //profile
  get profileRegistryType() {
    return 'profile_registry::ProfileRegistry'
  }

  profileRegistry(refresh = true): Promise<ProfileRegistry> {
    return this.resource<ProfileRegistry>(this.profileRegistryType, refresh)
  }

  get profileType() {
    return 'profile::Profile'
  }

  get profileSequenceType() {
    return 'u64'
  }

  get addressKeyType() {
    return 'address'
  }

  async profileSequenceByAddress(handle: string, id: string): Promise<string> {
    const profileSequenceRaw: string = await this.tableItem(
      handle,
      id,
      this.profileSequenceType,
      this.addressKeyType
    )
    return profileSequenceRaw
  }

  async profileBySequence(handle: string, id: string): Promise<Profile> {
    const profileRaw = await this.tableItem(handle, id, this.withRoot(this.profileType))
    return profileRaw
  }

  //portfolio
  get portfolioRegistryType() {
    return 'portfolio_registry::PortfolioRegistry'
  }

  async portfolioRegistry(refresh = true): Promise<PortfolioRegistry> {
    const prRaw = await this.resource<PortfolioRegistry>(this.portfolioRegistryType, refresh)
    return prRaw
  }

  get priceStoreType() {
    return 'price_store::PriceStore'
  }

  async priceStore(refresh = true): Promise<PriceStore> {
    const priceStoreRaw = await this.resource<PriceStore>(this.priceStoreType, refresh)
    return priceStoreRaw
  }

  get portfolioType() {
    return 'portfolio::Portfolio'
  }

  async portfolio(portAddress: string): Promise<Portfolio> {
    const res = await this.aptosClient.getAccountResource(
      portAddress,
      this.withRoot(this.portfolioType)
    )
    const portfolio = res.data as Portfolio
    return portfolio
  }

  //asset
  get assetRegistryType() {
    return 'asset_registry::AssetRegistry'
  }

  async assetRegistry(): Promise<AssetRegistry> {
    const ar = await this.resource<AssetRegistry>(this.assetRegistryType)
    return ar
  }

  get assetType() {
    return 'asset_registry::AssetInfo'
  }

  async assetById(handle: string, id: number): Promise<Asset> {
    const a: Asset = await this.tableItem(handle, id.toString(), this.withRoot(this.assetType))
    return a
  }

  async assetIdByType(handle: string, type: any): Promise<number> {
    const assetId = await this.tableItem(handle, type, 'u64', '0x1::type_info::TypeInfo')
    return assetId
  }

  get priceType() {
    return 'price_store::PriceData'
  }

  async price(handle: string, assetId: number): Promise<PriceData> {
    const p: PriceData = await this.tableItem(
      handle,
      assetId.toString(),
      this.withRoot(this.priceType)
    )
    return p
  }

  //collateral
  get collateralManifestType() {
    return 'collateral_manifest::Collaterals'
  }

  async collateralManifest(refresh = true): Promise<CollateralManifest> {
    const cmRaw = await this.resource<CollateralManifest>(this.collateralManifestType, refresh)
    return cmRaw
  }

  get collateralBasketsType() {
    return 'collateral_baskets::Baskets'
  }

  async basketContainer(): Promise<CollateralBasketContainer> {
    const bcRaw = await this.resource<CollateralBasketContainer>(this.collateralBasketsType)
    return bcRaw
  }

  get collateralBasketType() {
    return this.withRoot('collateral_baskets::Basket')
  }

  async basket(handle: string, id: string): Promise<CollateralBasket> {
    const bRaw: CollateralBasket = await this.tableItem(handle, id, this.collateralBasketType)
    return bRaw
  }

  async collateralInitiated(handle: string, id: string): Promise<boolean> {
    return await this.tableItem(handle, id, 'bool')
  }

  get collateralType() {
    return 'collateral::Collateral'
  }

  async collateral(handle: string, id: string): Promise<Collateral> {
    const cmTableItemRaw: Collateral = await this.tableItem(
      handle,
      id,
      this.withRoot(this.collateralType)
    )
    return cmTableItemRaw
  }

  brokerType(tBroker: string) {
    return `lending_broker::LendingBroker<${tBroker}>`
  }

  async broker(tBroker: string, refresh = true): Promise<Broker> {
    const typeTag = this.brokerType(tBroker)
    const brokerRaw = await this.resource<Broker>(typeTag, refresh)
    return brokerRaw
  }

  noteType(broker: string, noteType: string) {
    const type = `${noteType}<${broker}>`
    return type
  }

  fullNoteType(broker: string, noteType: string) {
    return `0x1::coin::CoinStore<${this.noteType(broker, noteType)}>`
  }

  async note(address: string, broker: string, noteType: string): Promise<Note> {
    const dNote = await this.aptosClient.getAccountResource(
      address,
      this.fullNoteType(broker, noteType)
    )
    const data = dNote.data as NoteData
    const type = dNote.type
    return { type, data }
  }

  frontEndContainerType(tBroker: string) {
    return `lending_frontend::Frontends<${tBroker}>`
  }

  async frontEndContainer(tBroker: string, refresh = true): Promise<FrontEndContainer> {
    const typeTag = this.frontEndContainerType(tBroker)
    const fecRaw = await this.resource<FrontEndContainer>(typeTag, refresh)
    return fecRaw
  }

  frontEndType(tBroker: string) {
    return this.withRoot(`lending_frontend::Frontend<${tBroker}>`)
  }

  async frontEnd(handle: string, id: string, tBroker: string): Promise<FrontEnd> {
    const feRaw: FrontEnd = await this.tableItem(handle, id, this.frontEndType(tBroker))
    return feRaw
  }
}
