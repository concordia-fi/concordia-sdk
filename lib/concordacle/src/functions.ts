import fetch from 'node-fetch'

const concordacleLatestURL =
  'https://us-central1-superposition-concordacle.cloudfunctions.net/queryConcordacleLatest?asset='
const passThroughURL =
  'https://us-central1-superposition-concordacle.cloudfunctions.net/priceProxy?asset='
const latestPricesSignedURL =
  'https://us-central1-superposition-concordacle.cloudfunctions.net/latestPricesSigned?assets='

export async function passthrough(asset: string): Promise<string> {
  let response = await fetch(passThroughURL + asset)

  return response.text()
}

export async function latestPricesSigned(assets: string): Promise<string> {
  let response = await fetch(latestPricesSignedURL + assets)

  return response.text()
}

export async function queryConcordacleLatest(asset: string): Promise<any> {
  let response = await fetch(concordacleLatestURL + asset)

  return response.json()
}
