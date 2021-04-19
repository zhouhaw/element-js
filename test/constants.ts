import { OpenSeaAPI } from '../src/api'
import { Network } from '../src/types'
import {CK_ADDRESS, CK_RINKEBY_ADDRESS} from '../src/constants'

export const MAINNET_API_KEY = "testKeyMainnet"
export const RINKEBY_API_KEY = "testKeyRinkeby"

export const mainApi = new OpenSeaAPI({
  apiKey: MAINNET_API_KEY,
  networkName: Network.Main
}, console.info)

export const rinkebyApi = new OpenSeaAPI({
  apiKey: RINKEBY_API_KEY,
  networkName: Network.Rinkeby
}, console.info)

