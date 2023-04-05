export const DEFAULT_MONEYGUN_ADDRESS =
  'aae1fc6ecc17227452f60deb89d4837f9d9e71a9f90be8aaac8184151d530633'

export enum COIN {
  BTC,
  SOL,
  ETH,
  USDC,
  USDT,
  APT
}

export class Moneygun {
  constructor(private aptosAddress = DEFAULT_MONEYGUN_ADDRESS) {}

  getCoinPayload(coin: COIN, amount: number) {
    return {
      function: `0x${this.aptosAddress}::gun::shoot`,
      type_arguments: [this.coinToType(coin)],
      arguments: [(amount * 1e6).toString()]
    }
  }

  private stringToType(t: string) {
    return `0x${this.aptosAddress}::coins::${t}`
  }

  coinToType(c: COIN) {
    switch (c) {
      case COIN.USDC:
        return this.stringToType('USDC')
      case COIN.USDT:
        return this.stringToType('USDT')
      case COIN.SOL:
        return this.stringToType('SOL')
      case COIN.BTC:
        return this.stringToType('BTC')
      case COIN.ETH:
        return this.stringToType('ETH')
      case COIN.APT:
        return '0x1::aptos_coin::AptosCoin'
    }
  }
}
