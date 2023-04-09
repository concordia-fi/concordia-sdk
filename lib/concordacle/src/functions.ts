export { passthrough, queryConcordacleLatest }
import fetch from 'node-fetch'

const concordacleLatestURL =
  'https://us-central1-superposition-concordacle.cloudfunctions.net/queryConcordacleLatest?asset='
const passThroughURL =
  'https://us-central1-superposition-concordacle.cloudfunctions.net/priceProxy?asset='

async function passthrough(asset: string): Promise<string> {
  let response = await fetch(passThroughURL + asset)

  return response.text()
}

async function queryConcordacleLatest(asset: string): Promise<any> {
  let response = await fetch(concordacleLatestURL + asset)

  return response.json()
}
