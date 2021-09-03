import { EventEmitter } from 'events'
import Web3 from 'web3'
import { CONTRACTS_ADDRESSES, NULL_ADDRESS } from './config'
import { ElementAPIConfig, ETHSending, Network, Token, TransactionConfig } from '../types'
import { AnnotatedFunctionOutput, LimitedCallSpec } from '../schema/types'
import { tokens } from '../schema/tokens'
import { common } from '../schema/schemas'

export class ContractSchemas extends EventEmitter {
  public web3: Web3

  public networkName: Network
  // public assetSchemas: any
  // address
  public contractsAddr: any
  public WETHAddr: string
  public elementSharedAssetAddr: string
  public elementixExchangeKeeperAddr: string
  public feeRecipientAddress: string

  public elementixProxyRegistry: string
  public elementixExchange: string
  public elementixTokenTransferProxy: string

  public WETHToekn: Token

  public paymentTokenList: Array<Token>
  public ETH: Token = {
    name: 'etherem',
    symbol: 'ETH',
    address: NULL_ADDRESS,
    decimals: 18
  }

  public Erc20Func
  public ElementRegistryFunc
  public ElementExchangeFunc

  constructor(web3: any, apiConfig: ElementAPIConfig = { networkName: Network.Rinkeby }) {
    super()
    const { networkName, paymentTokens } = apiConfig
    this.paymentTokenList = paymentTokens || tokens[networkName].otherTokens
    this.networkName = networkName
    const contracts = CONTRACTS_ADDRESSES[networkName]
    const exchangeHelperAddr = contracts.ExchangeHelper.toLowerCase()
    const exchangeAddr = contracts.ElementixExchange.toLowerCase()
    const proxyRegistryAddr = contracts.ElementixProxyRegistry.toLowerCase()
    const elementSharedAssetAddr = contracts.ElementSharedAsset.toLowerCase()
    const elementixExchangeKeeperAddr = contracts.ElementixExchangeKeeper.toLowerCase()
    const feeRecipientAddress = contracts.FeeRecipientAddress.toLowerCase()
    const tokenTransferProxyAddr = contracts.ElementixTokenTransferProxy.toLowerCase()
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
    if (exchangeHelperAddr && exchangeAddr && proxyRegistryAddr) {
      this.web3 = web3

      this.elementixProxyRegistry = proxyRegistryAddr
      this.elementixExchange = exchangeAddr
      // await this.exchange.methods.tokenTransferProxy().call()
      this.elementixTokenTransferProxy = tokenTransferProxyAddr

      this.Erc20Func = common.ERC20Schema.functions
      this.ElementRegistryFunc = common.ElementSchemas.registry.functions
      this.ElementExchangeFunc = common.ElementSchemas.exchange.functions
    } else {
      throw new Error(`${this.networkName}  abi undefined`)
    }
  }

  public async ethCall(callData: LimitedCallSpec, outputs: AnnotatedFunctionOutput[]): Promise<any> {
    const hexStr = await this.web3.eth.call(callData)
    const params = this.web3.eth.abi.decodeParameters(outputs, hexStr)
    if (params.__length__ == 1) {
      return params[0]
    }
    return params
  }

  //发送标准交易
  public async ethSend(callData: LimitedCallSpec, from: string): Promise<ETHSending> {
    // const from = this.elementAccount
    const gas = await this.web3.eth.estimateGas(callData)
    const gasPrice = await this.web3.eth.getGasPrice()
    const nonce = await this.web3.eth.getTransactionCount(from)
    const transactionObject = {
      from,
      to: callData.to,
      value: callData.value || 0,
      nonce,
      gas,
      gasPrice,
      data: callData.data
    } as TransactionConfig

    return new Promise((resolve, reject) => {
      const sendTx = this.web3.eth.sendTransaction(transactionObject).once('transactionHash', (txHash: string) => {
        resolve({ sendTx, txHash })
      })
    })
    // .on('receipt', (receipt: any) => {
    //   // console.log('approveTokenTransferProxy tx receipt', receipt)
    //   this.emit('receipt', receipt)
    // })
    // .catch((error: any) => {
    //   this.emit('error', error)
    // })
  }
}
