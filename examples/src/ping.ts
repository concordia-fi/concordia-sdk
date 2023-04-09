import {
  DEFAULT_CONFIG,
  getWalletAddress,
  signAndSubmit,
} from "wallet";
import { AptosClient } from 'aptos'
import {
  CONCORDIA_TESTNET_ADDRESS,
  Concordia
} from 'concordia'

const CLI_WALLET_PROFILE = 'concordia'
const NODE_URL = 'https://fullnode.testnet.aptoslabs.com/v1'

async function main() {
  const config = DEFAULT_CONFIG
  const profile = CLI_WALLET_PROFILE
  const aptosAddress = CONCORDIA_TESTNET_ADDRESS
  const nodeUrl = NODE_URL

  const aptosClient = new AptosClient(nodeUrl)
  const concordiaClient = new Concordia(aptosClient, {
    aptosAddress,
    solanaAddress: ''
  })

  const payload = concordiaClient.ping()

  const maxGas = '4'
  const hash = await signAndSubmit({
    config,
    profile,
    payload,
    maxGas
    })

  console.log(`Concordia ping successful: https://explorer.aptoslabs.com/txn/${hash}?network=testnet`)
}

main();
