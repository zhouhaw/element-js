import { ElementAPIConfig, Network } from './types'

const abiPath = '../abi/'

// abi
const AuthenticatedProxy = require(`../abi/AuthenticatedProxy.json`)
const ERC20 = require(`../abi/ERC20.json`)
const ERC721 = require(`../abi/ERC721v3.json`)
const ERC1155 = require(`../abi/ERC1155.json`)
// contract addr
const ElementSharedAsset = require(`../abi/ElementSharedAsset.json`)
const ElementixProxyRegistry = require(`../abi/ElementixProxyRegistry.json`)
const ElementixExchange = require(`../abi/ElementixExchange.json`)
const ExchangeHelper = require(`../abi/ExchangeHelper.json`)
const ElementixTokenTransferProxy = require(`../abi/ElementixTokenTransferProxy.json`)
const WETH = require(`../abi/WETH9Mocked.json`)
const MakeTokenID = require(`../abi/MakeTokenID.json`)

export class Contracts {
  public web3: any

  public networkName: Network
  // addr
  public tokenTransferProxyAddr: string
  public WETHAddr: string
  public elementSharedAssetAddr: string

  // abi
  public erc20: any
  public erc721: any
  public erc1155: any
  public authenticatedProxy: any

  // contracts
  public exchange: any
  public exchangeProxyRegistry: any
  public exchangeHelper: any
  public elementSharedAsset: any
  public WETH: any
  public makeTokenID: any

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
    const makeTokenIDAddr = MakeTokenID.networks[networkID].address

    this.WETHAddr = WETH.networks[networkID].address
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
      this.WETH = new web3.eth.Contract(WETH.abi, this.WETHAddr, options)
      this.makeTokenID = new web3.eth.Contract(MakeTokenID.abi, makeTokenIDAddr, options)
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
