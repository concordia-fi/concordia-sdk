import { AptosClient } from 'aptos'
import { AptosSubmitter } from './aptos/submitter'

export class Submitter {
  aptosSubmitter: AptosSubmitter
  constructor(aptosClient: AptosClient) {
    this.aptosSubmitter = new AptosSubmitter(aptosClient)
  }

  submitAptosTX(signedTX: Uint8Array) {
    return this.aptosSubmitter.submit(signedTX)
  }
}
