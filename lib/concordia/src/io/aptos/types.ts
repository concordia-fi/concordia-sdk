import { BasketID, CollateralID } from '../../types'

export type Table = {
  handle: string
}

export interface TypeInfo {
  account_address: string
  module_name: string
  struct_name: string
}

export type Account = {
  account: string
}

export type RA = {
  ra: {
    signer_cap: Account
  }
}

export type ProfileRegistry = {
  sequence: string
  profiles: Table
  sequence_lookup: Table
}

export type Broker = {
  available_coins: string
  basket_id: string
  borrowed_coins: string
  interest_rate_version: number
  params_version: number
  ts_interest_accrued: string
  underlying_asset_type: TypeInfo
  vault: RA
  broker_id: string
}

export type CollateralBasketContainer = {
  baskets: Table
  highest_id: string
}

export type CollateralBasket = {
  collaterals: {
    indexes: Table
    items: CollateralID[]
  }
  id: BasketID
}

export type CollateralManifest = {
  manifest: {
    highest_id: string
    items: Table
  }
}

export type Collateral = {
  asset_id: string
  haircut_bps: string
  max_global_deposit_usd: string
  max_global_deposit: string
  max_portfolio_deposit: string
  max_portfolio_deposit_usd: string
}

export type AssetRegistry = {
  id_to_info: Table
  total_assets: string
  type_to_id: Table
}

export type Asset = {
  asset_id: string
  chain_id: string
  precision: number
  type_info: TypeInfo
}

export type Profile = {
  authority: string
  id: string
  portfolios: string[]
  purse: RA
}

export type PortfolioRegistry = {
  all_portfolio_addresses: string[]
  key_to_address: Table
}

export type PriceStore = {
  prices: Table
}

export type PriceData = {
  asset_id: string
  values: PriceValues
}

export type PriceValues = {
  publish_time_seconds: string
  price: PriceValue
}

export type PriceValue = {
  usd: PreciseNumber
  confidence: PreciseNumber
}

export type PreciseNumber = {
  v: Decimal
}

export type Decimal = {
  value: string
  scale: string
}

export type PositionData = {
  indexes: Table
  items: string[]
  keys: { item_table: Table; items: CollateralID[] }
}

export type Portfolio = {
  basket_id: string
  liab_by_frontend: PositionData
  positions: {
    collaterals: PositionData
    liabilities: PositionData
    vault: RA
  }
  ra: {
    signer_cap: Account
  }
}

export type Counter = { counter: string; guid: object }
export type Value = { value: string }

export type NoteData = {
  coin: Value
  deposit_events: Counter
  frozen: boolean
  withdraw_events: Counter
}

export type Note = {
  type: string
  data: NoteData
}

export type FrontEndContainer = {
  frontends: Table
  id_index: string
}

export type FrontEnd = {
  authority: string
  loan_notes: string
  revenue_index: { v: { scale: number; value: string } }
  vault: RA
}
