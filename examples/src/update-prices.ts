import {
  DEFAULT_CONFIG,
  getRestURL,
  getWalletAddress,
  signAndSubmit,
} from "wallet";
import { AptosClient } from 'aptos'
import {
  CONCORDIA_TESTNET_ADDRESS,
  Concordia
} from 'concordia'
import {
  CONCORDACLE_TESTNET_PUBKEY,
  Concordacle
} from "concordacle";

const CLI_WALLET_PROFILE = 'concordia'

async function main() {
  const config = DEFAULT_CONFIG
  const profile = CLI_WALLET_PROFILE
  const aptosAddress = CONCORDIA_TESTNET_ADDRESS
  const nodeUrl = getRestURL(config, profile)

  const aptosClient = new AptosClient(nodeUrl)
  const concordiaClient = new Concordia(aptosClient, {
    aptosAddress,
    solanaAddress: ''
  })

  const concordacle = new Concordacle(CONCORDACLE_TESTNET_PUBKEY);
  const APTAssetID = '100'
  const USDCAssetID = '101'
  const assets = [
    APTAssetID,
    USDCAssetID
  ]
  const signedAptosPrice: Uint8Array = await concordacle.latestPricesSigned(assets)
  const payload = concordiaClient.updatePricesIX(signedAptosPrice)
  const maxGas = '600'
  const hash = await signAndSubmit({
    config,
    profile,
    payload,
    maxGas
    })
  console.log(`Price update successful: https://explorer.aptoslabs.com/txn/${hash}?network=testnet`)
}

main();
