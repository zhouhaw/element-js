import { ElementAPIConfig, Network, Token } from './types'

import { EventEmitter } from 'events'

// const abiPath = '../abi/'

// auth proxy abi
import AuthenticatedProxy from '../abi/AuthenticatedProxy.json'
// asset abi
import ERC20 from '../abi/ERC20.json'
import ERC721 from '../abi/ERC721v3.json'
import ERC1155 from '../abi/ERC1155.json'
// contract abi
import ElementSharedAsset from '../abi/ElementSharedAsset.json'
import ElementixProxyRegistry from '../abi/ElementixProxyRegistry.json'
import ElementixExchange from '../abi/ElementixExchange.json'
import ExchangeHelper from '../abi/ExchangeHelper.json'
import WETHAbi from '../abi/WETH9Mocked.json'
// const WETHAbi = import(`../abi/WETH9Mocked.json`)
import { CONTRACTS_ADDRESSES, NULL_ADDRESS } from './utils/constants'
import { tokens } from './schema/tokens'

// import { schemas } from './schema/schemas'

export class Contracts extends EventEmitter {
  public web3: any

  public networkName: Network
  // public assetSchemas: any
  // address
  public contractsAddr: any
  public WETHAddr: string
  public elementSharedAssetAddr: string
  public elementixExchangeKeeperAddr: string
  public feeRecipientAddress: string

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
  public elementSharedAssetV1: any
  public WETHContract: any

  public WETHToekn: Token

  public paymentTokenList: Array<Token>
  public ETH: Token = {
    name: 'etherem',
    symbol: 'ETH',
    address: NULL_ADDRESS,
    decimals: 18
  }

  constructor(web3: any, apiConfig: ElementAPIConfig = { networkName: Network.Rinkeby }) {
    super()
    const { networkName, paymentTokens } = apiConfig
    this.paymentTokenList = paymentTokens || tokens[networkName].otherTokens
    // const gasPrice = 10e9
    // const gasLimit = 80e4

    this.networkName = networkName
    // this.assetSchemas = schemas[networkName]

    const contracts = CONTRACTS_ADDRESSES[networkName]
    const exchangeHelperAddr = contracts.ExchangeHelper.toLowerCase()
    const exchangeAddr = contracts.ElementixExchange.toLowerCase()
    const proxyRegistryAddr = contracts.ElementixProxyRegistry.toLowerCase()
    const elementSharedAssetAddr = contracts.ElementSharedAsset.toLowerCase()
    const elementixExchangeKeeperAddr = contracts.ElementixExchangeKeeper.toLowerCase()
    const feeRecipientAddress = contracts.FeeRecipientAddress.toLowerCase()
    const wethAddr = contracts.WETH.toLowerCase()

    this.contractsAddr = contracts
    this.WETHAddr = wethAddr
    this.WETHToekn = {
      name: 'WETH9',
      symbol: 'WETH',
      address: wethAddr,
      decimals: 18
    }
    this.elementSharedAssetAddr = elementSharedAssetAddr
    this.elementixExchangeKeeperAddr = elementixExchangeKeeperAddr
    this.feeRecipientAddress = feeRecipientAddress

    const options = {
      // gas: gasLimit
    }
    if (exchangeHelperAddr && exchangeAddr && proxyRegistryAddr) {
      this.exchangeHelper = new web3.eth.Contract(ExchangeHelper.abi, exchangeHelperAddr, options)
      this.exchangeProxyRegistry = new web3.eth.Contract(ElementixProxyRegistry.abi, proxyRegistryAddr, options)
      this.exchange = new web3.eth.Contract(ElementixExchange.abi, exchangeAddr, options)

      // asset
      this.WETHContract = new web3.eth.Contract(WETHAbi.abi, wethAddr, options)
      this.elementSharedAsset = new web3.eth.Contract(ElementSharedAsset.abi, elementSharedAssetAddr, options)
      // abi
      this.erc20 = new web3.eth.Contract(ERC20.abi, options)
      this.erc721 = new web3.eth.Contract(ERC721.abi, options)
      this.erc1155 = new web3.eth.Contract(ERC1155.abi, options)
      this.authenticatedProxy = new web3.eth.Contract(AuthenticatedProxy.abi, options)

      this.web3 = web3
    } else {
      throw new Error(`${this.networkName}  abi undefined`)
    }

    if ((contracts as any).ElementSharedAssetV1) {
      this.elementSharedAssetV1 = new web3.eth.Contract(
        ElementSharedAsset.abi,
        (contracts as any).ElementSharedAssetV1,
        options
      )
    }
  }
}
