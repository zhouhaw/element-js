import * as WyvernSchemas from 'wyvern-schemas'
import {
  assert,
} from 'chai'

import {
  suite,
  test,
} from 'mocha'

import { OpenSeaPort } from '../../src/index'
import * as Web3 from 'web3'
import { Network } from '../../src/types'

import {
  RINKEBY_API_KEY,
  MAINNET_PROVIDER_URL,
  RINKEBY_PROVIDER_URL,
  mainApi,
  rinkebyApi,
  apiToTest
} from '../constants'

console.log(RINKEBY_PROVIDER_URL)
const provider = new Web3.providers.HttpProvider(MAINNET_PROVIDER_URL)
const rinkebyProvider = new Web3.providers.HttpProvider(RINKEBY_PROVIDER_URL)


console.log(rinkebyProvider)

const rinkebyClient = new OpenSeaPort(rinkebyProvider, {
  networkName: Network.Rinkeby,
  apiKey: RINKEBY_API_KEY
}, line => console.info(`RINKEBY: ${line}`))

suite('seaport: static calls', () => {
  test("Testnet StaticCall CheezeWizards", async () => {

     // Testnet Cheezewizards
    const tokenId = '3' // Testnet CheezeWizards TokenID
    const tokenAddress = '0x095731b672b76b00A0b5cb9D8258CD3F6E976cB2' // Testnet CheezeWizards Guild address

    // const asset = await rinkebyClient.api.getAsset({ tokenAddress, tokenId })


  })
})
