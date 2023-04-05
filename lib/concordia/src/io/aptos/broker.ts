import BN from 'bn.js'

export type Broker = {
  basket_id: BN
  ts_interest_accrued: BN
  borrowed_coins: BN
  available_coins: BN
}
