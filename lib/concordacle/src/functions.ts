import fetch from 'node-fetch'

const concordacleLatestURL =
  'https://us-central1-superposition-concordacle.cloudfunctions.net/queryConcordacleLatest?asset='
const latestPricesSignedURL =
  'https://us-central1-superposition-concordacle.cloudfunctions.net/latestPricesSigned?assets='
const queryAllURL =
  'https://us-central1-superposition-concordacle.cloudfunctions.net/assetManifest?ids=all'

export async function latestPricesSigned(assets: string): Promise<string> {
  const response = await fetch(latestPricesSignedURL + assets)
  if (!response.ok) {
    throw Error(response.statusText)
  }

  return response.text()
}

export async function queryConcordacleLatest(asset: string): Promise<any> {
  const response = await fetch(concordacleLatestURL + asset)
  if (!response.ok) {
    throw Error(response.statusText)
  }

  return response.json()
}

export async function queryAll(): Promise<string> {
  const response = await fetch(queryAllURL)
  if (!response.ok) {
    throw Error(response.statusText)
  }
  return response.json()
}
