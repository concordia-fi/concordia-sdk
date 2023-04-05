import {
  DEFAULT_CONFIG,
  getRestURL,
  getWalletAddress,
  signAndSubmit,
} from "wallet";
import { AptosClient } from 'aptos'
import { Concordia } from 'concordia'
import { COIN, Moneygun } from 'moneygun'

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

  const moneygun = new Moneygun()
  {
    const maxGas = '500'
    const hash = await signAndSubmit({
      config,
      profile,
      payload: {
        type: 'entry_function_payload',
        ...moneygun.getCoinPayload(COIN.USDC, 100_000)
      },
      maxGas
      })
    console.log(`USDC request successful: https://explorer.aptoslabs.com/txn/${hash}?network=testnet`)
  }

  {
    const walletAddress = getWalletAddress(config, profile)
    const profileInfo = await concordiaClient.fetcher.profile(`0x${walletAddress}`)
    const portAddress = profileInfo.portfolios[0]
    const payload = concordiaClient.addCollateralIX(portAddress, 100_000, moneygun.coinToType(COIN.USDC))
    const maxGas = '2000'
    const hash = await signAndSubmit({
      config,
      profile,
      payload,
      maxGas
      })
    console.log(`Adding USDC as collateral successful: https://explorer.aptoslabs.com/txn/${hash}?network=testnet`)
  }

  {
    const broker = `0x${CONCORDIA_ADDRESS}::lending_broker_types::A_USDC`
    const payload = concordiaClient.lendIX(broker, moneygun.coinToType(COIN.USDC), 100_000)
    const maxGas = '500'
    const hash = await signAndSubmit({
      config,
      profile,
      payload,
      maxGas
      })
    console.log(`Lending USDC successful: https://explorer.aptoslabs.com/txn/${hash}?network=testnet`)
  }
}

main();
