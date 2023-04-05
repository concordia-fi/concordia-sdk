import { AptosClient } from 'aptos'
export class AptosSubmitter {
  constructor(public client: AptosClient) {}

  async submit(payload: Uint8Array, wait = true) {
    const pending = await this.client.submitSignedBCSTransaction(payload)
    if (wait) {
      await this.client.waitForTransactionWithResult(pending.hash)
    }

    return { hash: pending.hash, sig: pending.signature, version: pending.sequence_number }
  }
}
