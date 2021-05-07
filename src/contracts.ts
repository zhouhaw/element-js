import { Network } from './schema/types'
import { ElementAPIConfig } from './types'

const abiPath = '../abi/'
const ElementSharedAsset = require(`${abiPath}ElementSharedAsset.json`)
const ElementixProxyRegistry = require(`${abiPath}ElementixProxyRegistry.json`)
const ElementixExchange = require(`${abiPath}ElementixExchange.json`)
const ExchangeHelper = require(`${abiPath}ExchangeHelper.json`)
const ERC20 = require(`${abiPath}ERC20.json`)
const ElementixTokenTransferProxy = require(`${abiPath}ElementixTokenTransferProxy.json`)
const WEHT = require(`${abiPath}WETH9Mocked.json`)



export class Contracts {
  public web3: any

  public networkName: Network

  public erc20: any

  public exchange: any

  public exchangeProxyRegistry: any

  public exchangeHelper: any

  public elementSharedAsset: any

  public tokenTransferProxyAddr: string

  public WETHAddr: string

  // let networkID: number = await web3.eth.net.getId()
  constructor(web3: any, apiConfig: ElementAPIConfig = { networkName: Network.Rinkeby, networkID: 1 }) {
    const { networkID, networkName } = apiConfig
    const gasPrice = 10e9
    const gasLimit = 80e4
    this.networkName = networkName
    const exchangeHelperAddr = ExchangeHelper.networks[networkID].address
    const exchangeAddr = ElementixExchange.networks[networkID].address
    const proxyRegistryAddr = ElementixProxyRegistry.networks[networkID].address
    const elementSharedAssetAddr = ElementSharedAsset.networks[networkID].address

    this.WETHAddr = WEHT.networks[networkID].address

    this.tokenTransferProxyAddr = ElementixTokenTransferProxy.networks[networkID].address

    if (exchangeHelperAddr && exchangeAddr && proxyRegistryAddr) {
      this.exchangeHelper = new web3.eth.Contract(ExchangeHelper.abi, exchangeHelperAddr, {
        gas: gasLimit
      })
      this.exchangeProxyRegistry = new web3.eth.Contract(ElementixProxyRegistry.abi, proxyRegistryAddr, {
        gas: gasLimit
      })
      this.erc20 = new web3.eth.Contract(ERC20.abi, {
        gas: gasLimit
      })
      this.exchange = new web3.eth.Contract(ElementixExchange.abi, exchangeAddr, {
        gas: gasLimit
      })

      this.elementSharedAsset = new web3.eth.Contract(ElementSharedAsset.abi, elementSharedAssetAddr, {
        gas: gasLimit
      })
      this.web3 = web3
    } else {
      // eslint-disable-next-line no-throw-literal
      throw `${this.networkName} networkID ${networkID} abi undefined`
    }
  }
}

