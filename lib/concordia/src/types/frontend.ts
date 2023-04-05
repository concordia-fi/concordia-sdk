export interface IFrontEndContainer {
  handle: string
  idIndex: string
}

export interface IFrontEnd {
  authority: string
  loanNotes: number
  revenueIndex: {
    scale: number
    value: number
  }
  vault: string
}
