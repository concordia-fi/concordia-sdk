import {
  DEFAULT_CONFIG,
  getRestURL,
  getWalletAddress,
  signAndSubmit,
} from "wallet";
import { AptosClient } from 'aptos'
import { Concordia } from 'concordia'

const CLI_WALLET_PROFILE = 'concordia'
const CONCORDIA_ADDRESS = 'c59f582e4c6ed7a66f366b61d53000ccf514dfb6271cddff02dc355e225fbb04'

async function main() {
  const config = DEFAULT_CONFIG
  const profile = CLI_WALLET_PROFILE
  const aptosAddress = CONCORDIA_ADDRESS
  const nodeUrl = getRestURL(config, profile)

  const aptosClient = new AptosClient(nodeUrl)
  const concordiaClient = new Concordia(aptosClient, {
    aptosAddress,
    solanaAddress: ''
  })

  {
    const payload = concordiaClient.initProfileIX()

    const maxGas = '2000'
    const hash = await signAndSubmit({
      config,
      profile,
      payload,
      maxGas
      })

    console.log(`Init profile successful: https://explorer.aptoslabs.com/txn/${hash}?network=testnet`)
  }

  {
    const container = await concordiaClient.fetcher.basketContainer()
    const payload = concordiaClient.initPortfolioIX(container.highestID)
    const maxGas = '3000'
    const hash = await signAndSubmit({
      config,
      profile,
      payload,
      maxGas
      })

    console.log(`Init portfolio successful: https://explorer.aptoslabs.com/txn/${hash}?network=testnet`)
  }
}

main();
