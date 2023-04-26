import { AptosClient, AptosAccount, HexString } from 'aptos'

export interface EntryFunctionPayload {
  type: 'entry_function_payload'
  function: string
  arguments: any[] // matching Aptos's EntryFunctionPayload
  type_arguments: string[]
}

const path = require('path')
export const DEFAULT_CONFIG = path.join(process.env.HOME, '.aptos', 'config.yaml')

export const DEFAULT_PROFILE = 'default'

const yaml = require('js-yaml')
const fs = require('fs')

function getConfig(file: string) {
  return yaml.load(fs.readFileSync(file, 'utf8'))
}

export function walletExists(configFile: string, profile: string) {
  if (!fs.existsSync(configFile)) {
    return false
  }
  const config = getConfig(configFile)
  return profile in config.profiles
}

export function getWalletAddress(configFile: string, profile: string) {
  const config = getConfig(configFile)
  return config.profiles[profile].account
}

function getWalletPrivateKey(configFile: string, profile: string) {
  const config = getConfig(configFile)
  return config.profiles[profile].private_key
}

export function getRestURL(configFile: string, profile: string) {
  const config = getConfig(configFile)
  return config.profiles[profile].rest_url
}

export function getWalletAccount(configFile: string, profile: string) {
  const key = getWalletPrivateKey(configFile, profile)

  return new AptosAccount(new HexString(key).toUint8Array())
}

// Gas is expected to be a number contained in a string
const DEFAULT_MAX_GAS = '200000'

export async function signAndSubmit({
  config,
  profile,
  payload,
  maxGas = DEFAULT_MAX_GAS
}: {
  config: string
  profile: string
  payload: EntryFunctionPayload
  maxGas?: string
}) {
  const restURL = getRestURL(config, profile)

  const aptos = new AptosClient(restURL)

  const signer = getWalletAccount(config, profile)

  const rawTx = await aptos.generateTransaction(signer.address(), payload, {
    max_gas_amount: maxGas
  })
  const signedTx = await aptos.signTransaction(signer, rawTx)
  const pendingTx = await aptos.submitTransaction(signedTx)
  await aptos.waitForTransaction(pendingTx.hash, { checkSuccess: true })
  return pendingTx.hash
}
