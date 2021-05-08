import { Network } from './schema/types'
import { ElementAPIConfig } from './types'

const abiPath = '../abi/'

// abi
const AuthenticatedProxy = require(`${abiPath}AuthenticatedProxy.json`)
const ERC20 = require(`${abiPath}ERC20.json`)
const ERC721 = require(`${abiPath}ERC721v3.json`)
const ERC1155 = require(`${abiPath}ERC1155.json`)
// contract addr
const ElementSharedAsset = require(`${abiPath}ElementSharedAsset.json`)
const ElementixProxyRegistry = require(`${abiPath}ElementixProxyRegistry.json`)
const ElementixExchange = require(`${abiPath}ElementixExchange.json`)
const ExchangeHelper = require(`${abiPath}ExchangeHelper.json`)
const ElementixTokenTransferProxy = require(`${abiPath}ElementixTokenTransferProxy.json`)
const WEHT = require(`${abiPath}WETH9Mocked.json`)

export class Contracts {
  public web3: any

  public networkName: Network
  // addr
  public tokenTransferProxyAddr: string
  public WETHAddr: string
  public elementSharedAssetAddr: string

  //abi
  public erc20: any
  public erc721: any
  public erc1155: any
  public authenticatedProxy: any

  // contracts
  public exchange: any
  public exchangeProxyRegistry: any
  public exchangeHelper: any
  public elementSharedAsset: any

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
    this.elementSharedAssetAddr = elementSharedAssetAddr

    this.tokenTransferProxyAddr = ElementixTokenTransferProxy.networks[networkID].address

    let options = {
      gas: gasLimit
    }
    if (exchangeHelperAddr && exchangeAddr && proxyRegistryAddr) {
      this.exchangeHelper = new web3.eth.Contract(ExchangeHelper.abi, exchangeHelperAddr, options)
      this.exchangeProxyRegistry = new web3.eth.Contract(ElementixProxyRegistry.abi, proxyRegistryAddr, options)
      this.exchange = new web3.eth.Contract(ElementixExchange.abi, exchangeAddr, options)
      // asset
      this.elementSharedAsset = new web3.eth.Contract(ElementSharedAsset.abi, elementSharedAssetAddr, options)
      // abi
      this.erc20 = new web3.eth.Contract(ERC20.abi, options)
      this.erc721 = new web3.eth.Contract(ERC721.abi, options)
      this.erc1155 = new web3.eth.Contract(ERC1155.abi, options)
      this.authenticatedProxy = new web3.eth.Contract(AuthenticatedProxy.abi, options)
      this.web3 = web3
    } else {
      // eslint-disable-next-line no-throw-literal
      throw `${this.networkName} networkID ${networkID} abi undefined`
    }
  }
}
