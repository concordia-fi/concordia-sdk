import { PortfolioID } from './portfolio'

export type ProfileID = string

export interface IProfile {
  authority: string
  profileId: ProfileID
  portfolios: PortfolioID[]
  purse: string
}

export interface IRegistry {
  sequence: string
  profilesHandle: string
  sequenceHandle: string
}
