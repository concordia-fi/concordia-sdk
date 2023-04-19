import * as functions from './functions'
import * as ed from '@noble/ed25519'
export { applyExponentiation, getMockPayload }

export const CONCORDACLE_TESTNET_PUBKEY =
  '390e3c688489559688b823b80b7805f11ab9f8dc1f1156d99b48de7bc4ff4a4a'

export type Signature = string
export interface PricePayload {
  conf: number
  expo: number
  price: number
  publish_time: number
}
export interface PriceData {
  signature: Signature
  payload: PricePayload
}

export class Concordacle {
  public_key: string

  constructor(pubkey: string) {
    this.public_key = pubkey
  }

  async priceProxy(asset: string): Promise<Uint8Array> {
    return new Uint8Array(
      (await functions.passthrough(asset)).match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
    )
  }

  async latestPricesSigned(assets: string[]): Promise<Uint8Array> {
    const commaSeparated = assets.join(',')
    return new Uint8Array(
      (await functions.latestPricesSigned(commaSeparated))
        .match(/.{1,2}/g)
        .map((byte) => parseInt(byte, 16))
    )
  }

  async queryConcordacleLatestWithVerify(asset: string): Promise<PriceData> {
    const response = await functions.queryConcordacleLatest(asset)

    //convert payload to unique hex string
    let fingerPrint = payloadToHex(response.payload)
    const len = fingerPrint.length

    //pad the hex string with zeros to make it 256 bits
    for (let i = 0; i < 64 - len; i++) {
      fingerPrint = '0'.concat(fingerPrint)
    }

    const signature = response.signature

    const valid = await ed.verify(signature, fingerPrint, this.public_key)

    return new Promise((resolve, reject) => {
      if (valid) {
        resolve(response.payload)
      } else {
        reject('Invalid signature')
      }
    })
  }

  async queryConcordacleLatest(asset: string): Promise<PriceData> {
    return functions.queryConcordacleLatest(asset)
  }
}

//and removes the hyphens from the values
function payloadToHex(payload: PricePayload): string {
  const concat = payload.conf
    .toString(16)
    .concat(payload.expo.toString(16))
    .concat(payload.price.toString(16))
    .concat(payload.publish_time.toString(16))
  return concat.replace(/-/g, '')
}

function applyExponentiation(price: number, expo: number): number {
  return price * Math.pow(10, expo)
}

async function getMockPayload(): Promise<PriceData> {
  const payload = {
    conf: 1,
    expo: 1,
    price: 1,
    publish_time: Date.now()
  }

  //convert payload to unique hex string
  let fingerPrint = payloadToHex(payload)
  const len = fingerPrint.length

  //pad the hex string with zeros to make it 256 bits
  for (let i = 0; i < 64 - len; i++) {
    fingerPrint = '0'.concat(fingerPrint)
  }

  //sign the fingerprint
  const signature = Buffer.from(await ed.sign(fingerPrint, process.env.PayKey)).toString('hex')

  //form a signed payload
  const signedPayload = { signature, payload }

  return new Promise((resolve, reject) => {
    resolve(signedPayload)
  })
}
