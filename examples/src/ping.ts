import {
  DEFAULT_CONFIG,
  getWalletAddress,
  signAndSubmit,
} from "wallet";
import { AptosClient } from 'aptos'
import { Concordia } from 'concordia'

const CLI_WALLET_PROFILE = 'concordia'
const CONCORDIA_ADDRESS = '46c3ce6a777c9b6b743377fd5a602a6176c96192a25e825e7053e0231c96b3d5'
const NODE_URL = 'https://fullnode.testnet.aptoslabs.com/v1'

async function main() {
  const config = DEFAULT_CONFIG
  const profile = CLI_WALLET_PROFILE
  const aptosAddress = CONCORDIA_ADDRESS
  const nodeUrl = NODE_URL

  const aptosClient = new AptosClient(nodeUrl)
  const concordiaClient = new Concordia(aptosClient, {
    aptosAddress,
    solanaAddress: ''
  })

  const payload = concordiaClient.ping()

  const hash = await signAndSubmit({
    config: config,
    profile: profile,
    payload: payload
    })

  console.log('Concordia ping complete!')
  console.log(hash)
}

main();
