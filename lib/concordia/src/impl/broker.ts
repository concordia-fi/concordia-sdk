import { AssetID } from './../types/asset'
import { TBroker, IBroker, IBrokerData } from '../types'

export class Broker implements IBroker {
  assetId: AssetID
  constructor(public id: TBroker) {}
  repayIX(portfolio: string, size: number): object {
    throw new Error('Method not implemented.')
  }
  lendIX(size: number): object {
    throw new Error('Method not implemented.')
  }
  redeemIX(size: number): object {
    throw new Error('Method not implemented.')
  }
  data(): Promise<IBrokerData> {
    throw new Error('Method not implemented.')
  }

  borrowIX(portfolio: string, size: number): object {
    throw new Error('Method not implemented.')
  }
}
