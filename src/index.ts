import * as types from './types'
export { OpenSeaAPI } from './api'
export { OpenSeaPort } from './seaport'
export { EventType, Network } from './types'
export { orderToJSON, orderFromJSON, WyvernProtocol } from './utils/utils'
export {
  encodeCall,
  encodeSell, encodeAtomicizedBuy, encodeAtomicizedSell,
  encodeDefaultCall, encodeReplacementPattern,
  AbiType,
} from './utils/schema'

export type EventData = types.EventData


/**
 * Example setup:
 *
 * import * as Web3 from 'web3'
 * import { OpenSeaPort, Network } from 'opensea-js'
 * const provider = new Web3.providers.HttpProvider('https://mainnet.infura.io')
 * const client = new OpenSeaPort(provider, {
 *   networkName: Network.Main
 * })
 */