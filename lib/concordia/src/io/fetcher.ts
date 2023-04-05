import { AptosClient } from 'aptos'
import {
  IAsset,
  IAssetRegistry,
  IBasket,
  IBasketContainer,
  IBrokerData,
  ICollateral,
  INote,
  IManifest,
  IPortfolioData,
  IPortfolioRegistry,
  IPrice,
  IPriceStore,
  IProfile,
  IRegistry
} from '../types'
import { IFrontEnd, IFrontEndContainer } from '../types/frontend'
import { AptosFetcher } from './aptos/aptosFetcher'
import { TypeInfo } from './aptos/types'

/**
 * The Fetcher is responsible for performing read-only IO with blockchains
 * It instantiates multiple blockchain-specific fetch utilities that pull in raw data and parse it
 */
export class Fetcher {
  aptosFetcher: AptosFetcher
  constructor(aptosClient: AptosClient, aptosAddress: string) {
    this.aptosFetcher = new AptosFetcher(aptosClient, aptosAddress)
  }

  hexToUTF(hex: string) {
    return decodeURIComponent(hex.replace(/\s+/g, '').replace(/[0-9a-f]{2}/g, '%$&'))
  }

  buildAssetType(ti: TypeInfo) {
    const mod = this.hexToUTF(ti.module_name.slice(2))
    const str = this.hexToUTF(ti.struct_name.slice(2))
    return ti.account_address + '::' + mod + '::' + str
  }

  buildRawType(ti: TypeInfo) {
    return ti.account_address + '::' + ti.module_name + '::' + ti.struct_name
  }

  //collateral
  async collateralManifest(): Promise<IManifest> {
    const cm = await this.aptosFetcher.collateralManifest()
    return {
      highestID: cm.manifest.highest_id,
      handle: cm.manifest.items.handle
    }
  }

  async basketContainer(): Promise<IBasketContainer> {
    const bc = await this.aptosFetcher.basketContainer()
    return {
      highestID: bc.highest_id,
      handle: bc.baskets.handle
    }
  }

  async basket(handle: string, id: string): Promise<IBasket> {
    const b = await this.aptosFetcher.basket(handle, id)
    return { basketId: b.id, items: b.collaterals.items }
  }

  async collateral(handle: string, id: string): Promise<ICollateral> {
    const c = await this.aptosFetcher.collateral(handle, id)
    return {
      assetId: c.asset_id,
      haircutBps: parseInt(c.haircut_bps),
      maxGlobalDepositUsd: parseInt(c.max_global_deposit_usd),
      maxGlobalDeposit: parseInt(c.max_global_deposit),
      maxPortfolioDeposit: parseInt(c.max_portfolio_deposit),
      maxPortfolioDepositUsd: parseInt(c.max_portfolio_deposit_usd)
    }
  }

  //broker
  async broker(brokerID: string): Promise<IBrokerData> {
    const b = await this.aptosFetcher.broker(brokerID)
    const ti = b.underlying_asset_type
    const assetType = this.buildAssetType(ti)
    const ar = await this.assetRegistry()
    const assetId = await this.aptosFetcher.assetIdByType(ar.typeToIdHandle, ti)
    return {
      assetId,
      availableCoins: parseInt(b.available_coins),
      basketId: b.basket_id,
      borrowedCoins: parseInt(b.borrowed_coins),
      interestRateVersion: b.interest_rate_version,
      paramsVersion: b.params_version,
      tsInterestAccrued: b.ts_interest_accrued,
      assetType,
      signerCapAccount: b.vault.ra.signer_cap.account
    }
  }

  //profile
  async profileBySequence(handle: string, id: string): Promise<IProfile> {
    const p = await this.aptosFetcher.profileBySequence(handle, id)
    return {
      authority: p.authority,
      profileId: p.id,
      portfolios: p.portfolios,
      purse: p.purse.ra.signer_cap.account
    }
  }

  async profileRegistry(): Promise<IRegistry> {
    const registry = await this.aptosFetcher.profileRegistry()
    return {
      sequence: registry.sequence,
      profilesHandle: registry.profiles.handle,
      sequenceHandle: registry.sequence_lookup.handle
    }
  }

  async profile(address: string): Promise<IProfile> {
    const registry = await this.profileRegistry()
    const sequence = await this.aptosFetcher.profileSequenceByAddress(
      registry.sequenceHandle,
      address.substring(2)
    )
    const profile = await this.profileBySequence(registry.profilesHandle, sequence)
    return profile
  }

  //portfolio
  async portfolioRegistry(): Promise<IPortfolioRegistry> {
    const pr = await this.aptosFetcher.portfolioRegistry()
    return {
      allAddresses: pr.all_portfolio_addresses,
      keyToAddressHandle: pr.key_to_address.handle
    }
  }

  async priceStore(): Promise<IPriceStore> {
    const priceStore = await this.aptosFetcher.priceStore()
    return {
      assetIdToPriceHandle: priceStore.prices.handle
    }
  }

  async price(handle: string, assetId: number): Promise<IPrice> {
    const p = await this.aptosFetcher.price(handle, assetId)
    return {
      assetId: parseInt(p.asset_id),
      publishTime: parseInt(p.values.ts),
      price: BigInt(p.values.price.usd.v.value),
      confidence: BigInt(p.values.price.confidence.v.value)
    }
  }

  async portfolio(portAddress: string): Promise<IPortfolioData> {
    const p = await this.aptosFetcher.portfolio(portAddress)
    return {
      address: portAddress,
      basketId: p.basket_id,
      liabByFrontEnd: {
        handle: p.liab_by_frontend.indexes.handle,
        items: p.liab_by_frontend.items.map((i) => parseInt(i)),
        keys: {
          itemTableHandle: p.liab_by_frontend.keys.item_table.handle,
          items: p.liab_by_frontend.keys.items
        }
      },
      positions: {
        collaterals: {
          handle: p.positions.collaterals.indexes.handle,
          items: p.positions.collaterals.items.map((i) => parseInt(i)),
          keys: {
            itemTableHandle: p.positions.collaterals.keys.item_table.handle,
            items: p.positions.collaterals.keys.items
          }
        },
        liabilities: {
          handle: p.positions.liabilities.indexes.handle,
          items: p.positions.liabilities.items.map((i) => parseInt(i)),
          keys: {
            itemTableHandle: p.positions.collaterals.keys.item_table.handle,
            items: p.positions.collaterals.keys.items
          }
        },
        vault: p.positions.vault.ra.signer_cap.account
      },
      ra: p.ra.signer_cap.account
    }
  }

  async note(address: string, broker: string, noteType: string): Promise<INote> {
    const n = await this.aptosFetcher.note(address, broker, noteType)
    return {
      type: n.type,
      value: parseInt(n.data.coin.value),
      depositEvents: n.data.deposit_events,
      frozen: n.data.frozen,
      withdrawEvents: n.data.withdraw_events
    }
  }

  //asset
  async assetRegistry(): Promise<IAssetRegistry> {
    const ar = await this.aptosFetcher.assetRegistry()
    return {
      idToInfoHandle: ar.id_to_info.handle,
      typeToIdHandle: ar.type_to_id.handle,
      totalAssets: parseInt(ar.total_assets)
    }
  }

  async assetById(handle: string, id: string): Promise<IAsset> {
    const a = await this.aptosFetcher.assetById(handle, id)
    const ti = a.type_info
    const type = this.buildAssetType(ti)
    return {
      assetId: a.asset_id,
      chainId: a.chain_id,
      decimals: a.precision,
      type,
      logo: '',
      description: ''
    }
  }

  //frontend
  async frontEndContainer(tBroker: string): Promise<IFrontEndContainer> {
    const fec = await this.aptosFetcher.frontEndContainer(tBroker)
    return {
      handle: fec.frontends.handle,
      idIndex: fec.id_index
    }
  }

  async frontEnd(handle: string, id: string, tBroker: string): Promise<IFrontEnd> {
    const fe = await this.aptosFetcher.frontEnd(handle, id, tBroker)
    return {
      authority: fe.authority,
      loanNotes: parseInt(fe.loan_notes),
      revenueIndex: {
        scale: fe.revenue_index.v.scale,
        value: parseInt(fe.revenue_index.v.value)
      },
      vault: fe.vault.ra.signer_cap.account
    }
  }
}
