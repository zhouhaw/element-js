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
import { CONTRACTS_ADDRESSES } from './utils/constants'

export class Contracts {
  public web3: any

  public networkName: Network
  // addr
  public tokenTransferProxyAddr: string
  public WETHAddr: string
  public elementSharedAssetAddr: string
  public elementixExchangeKeeperAddr: string
  public defaultAccount: string

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
  // public makeTokenID: any

  // let networkID: number = await web3.eth.net.getId()
  constructor(web3: any, apiConfig: ElementAPIConfig = { networkName: Network.Rinkeby }) {
    const { networkName } = apiConfig
    const gasPrice = 10e9
    const gasLimit = 80e4

    this.networkName = networkName
    const contracts = CONTRACTS_ADDRESSES[networkName]
    const exchangeHelperAddr = contracts.ExchangeHelper.toLowerCase()
    const exchangeAddr = contracts.ElementixExchange.toLowerCase()
    const proxyRegistryAddr = contracts.ElementixProxyRegistry.toLowerCase()
    const elementSharedAssetAddr = contracts.ElementSharedAsset.toLowerCase()
    const elementixTokenTransferProxyAddr = contracts.ElementixTokenTransferProxy.toLowerCase()
    const elementixExchangeKeeperAddr = contracts.ElementixExchangeKeeper.toLowerCase()
    const wethAddr = contracts.WETH.toLowerCase()
    // }

    // const makeTokenIDAddr = MakeTokenID.networks[networkID].address

    this.WETHAddr = wethAddr
    this.elementSharedAssetAddr = elementSharedAssetAddr
    this.elementixExchangeKeeperAddr = elementixExchangeKeeperAddr
    this.tokenTransferProxyAddr = elementixTokenTransferProxyAddr

    let options = {
      gas: gasLimit
    }
    if (exchangeHelperAddr && exchangeAddr && proxyRegistryAddr) {
      this.exchangeHelper = new web3.eth.Contract(ExchangeHelper.abi, exchangeHelperAddr, options)
      this.exchangeProxyRegistry = new web3.eth.Contract(ElementixProxyRegistry.abi, proxyRegistryAddr, options)
      this.exchange = new web3.eth.Contract(ElementixExchange.abi, exchangeAddr, options)

      // asset
      this.WETH = new web3.eth.Contract(WETH.abi, wethAddr, options)
      // this.makeTokenID = new web3.eth.Contract(MakeTokenID.abi, makeTokenIDAddr, options)
      this.elementSharedAsset = new web3.eth.Contract(ElementSharedAsset.abi, elementSharedAssetAddr, options)
      // abi
      this.erc20 = new web3.eth.Contract(ERC20.abi, options)
      this.erc721 = new web3.eth.Contract(ERC721.abi, options)
      this.erc1155 = new web3.eth.Contract(ERC1155.abi, options)
      this.authenticatedProxy = new web3.eth.Contract(AuthenticatedProxy.abi, options)

      this.web3 = web3
      this.defaultAccount = web3.eth.defaultAccount.toLowerCase()
    } else {
      // eslint-disable-next-line no-throw-literal
      throw `${this.networkName}  abi undefined`
    }
  }
}
