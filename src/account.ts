// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { ElementError } from './base/error'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Contracts } from './contracts'
import {
  approveERC1155TransferProxy,
  approveERC721TransferProxy,
  approveSchemaProxy,
  approveTokenTransferProxy,
  registerProxy
} from './utils/approve'
import { ElementAPIConfig, Network } from './types'
import { EthApi, Web3 } from './api/ethApi'
import { encodeCall, encodeParamsCall, schemas } from './schema'
import { MAX_UINT_256 } from './utils/constants'
import { common } from './schema/schemas'
import { LimitedCallSpec, AnnotatedFunctionOutput, SchemaFunctions } from './schema/types'
import { OrderCheckStatus } from './orders'

// 根据 DB签名过的订单 make一个对手单
export class Account extends Contracts {
  public ethApi: EthApi
  public elementAccount: string
  public Erc20Func
  public ElementFunc

  constructor(web3: Web3, apiConfig: ElementAPIConfig = { networkName: Network.Rinkeby }) {
    super(web3, apiConfig)
    this.elementAccount = apiConfig.account || web3.eth.defaultAccount?.toLowerCase() || ''
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.ethApi = new EthApi(web3.currentProvider.host)
    this.Erc20Func = common.ERC20Schema.functions
    this.ElementFunc = common.ElementSchemas.functions
  }

  public async ethCall(callData: LimitedCallSpec, outputs: AnnotatedFunctionOutput[]): Promise<any> {
    const hexStr = await this.web3.eth.call(callData)
    const params = this.web3.eth.abi.decodeParameters(outputs, hexStr)
    if (params.__length__ == 1) {
      return params[0]
    }
    return params
  }

  public async ethSend(callData: LimitedCallSpec): Promise<any> {
    const from = this.elementAccount
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
    }
    return this.web3.eth
      .sendTransaction(transactionObject)
      .on('transactionHash', (txHash: string) => {
        // console.log('approveTokenTransferProxy tx txHash', txHash)
        this.emit('transactionHash', txHash)
      })
      .on('receipt', (receipt: string) => {
        // console.log('approveTokenTransferProxy tx receipt', receipt)
        this.emit('receipt', receipt)
      })
      .catch((error: any) => {
        this.emit('error', error)
      })
  }

  public async getProxy() {
    const account = this.elementAccount
    const to = this.contractsAddr.ElementixProxyRegistry
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const accountApprove = this.ElementFunc.isApprove({ account })
    const data = encodeCall(accountApprove, [this.elementAccount])
    // const proxy = await this.exchangeProxyRegistry.methods.proxies(account).encodeABI()
    const callData = { to, data }
    return this.ethCall(callData, accountApprove?.outputs)
  }

  public async registerProxy() {
    const to = this.contractsAddr.ElementixProxyRegistry
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const accountApprove = this.ElementFunc.approve()
    const data = encodeCall(accountApprove, [])
    // const proxy = await this.exchangeProxyRegistry.methods.registerProxy().encodeABI()
    // console.log(data)
    // console.log(proxy)
    const callData = { to, data }
    return this.ethSend(callData)
  }

  public async checkTokenTransferProxy(tokenAddr: string): Promise<string> {
    const accountProxy = await this.getProxy()
    const proxy = await this.exchange.methods.tokenTransferProxy().call()
    const to = tokenAddr
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const accountApprove = this.Erc20Func.isApprove({ account: accountProxy }, proxy)
    const data = encodeParamsCall(accountApprove)
    const callData = { to, data }
    return this.ethCall(callData, accountApprove?.outputs)
  }

  public async getTokenBalances(tokenAddr: string): Promise<string> {
    const account = this.elementAccount
    const to = tokenAddr
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const accountBal = this.Erc20Func.countOf({ account })
    const data = encodeParamsCall(accountBal)
    const callData = { to, data }
    return this.ethCall(callData, accountBal?.outputs)
  }

  public async approveTokenTransferProxy(tokenAddr: string): Promise<any> {
    // const accountProxy = await this.getProxy()
    const proxy = await this.exchange.methods.tokenTransferProxy().call()
    console.log(proxy)
    const to = tokenAddr
    const quantity = MAX_UINT_256.toString()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const accountApprove = this.Erc20Func.approve({ quantity }, proxy)
    const data = encodeCall(accountApprove, [proxy, quantity])

    const erc20Contract = this.erc20.clone()
    erc20Contract.options.address = tokenAddr
    const proxyData = await erc20Contract.methods.approve(proxy, quantity).encodeABI()
    console.log(data)
    console.log(proxyData)
    const callData = { to, data }
    return this.ethSend(callData)
  }

  public async initApprove(error: ElementError) {
    console.log('orderErrorHandler', error)
    const erc20Contract = this.erc20.clone()
    const erc1155Contract = this.erc1155.clone()
    const erc721Contract = this.erc721.clone()
    const account = this.web3.eth.defaultAccount
    switch (String(error.code)) {
      case '1001': // initialize
        await this.registerProxy()
        break
      case '1101': // 批准任何erc20 token
        erc20Contract.options.address = error.data.erc20Address
        await approveTokenTransferProxy({
          exchangeContract: this.exchange,
          erc20Contract,
          account
        })
        break
      case '1102': // checkApproveERC1155TransferProxy
        erc1155Contract.options.address = error.data.nftAddress
        await approveERC1155TransferProxy({
          proxyRegistryContract: this.exchangeProxyRegistry,
          erc1155Contract,
          account
        })
        break
      case '1106':
        erc721Contract.options.address = error.data.nftAddress
        await approveERC721TransferProxy({
          proxyRegistryContract: this.exchangeProxyRegistry,
          erc721Contract,
          account,
          tokenId: error.data.tokenId
        })
        break
      case '1108':
        await approveSchemaProxy({
          contract: this,
          orderMetadata: error.data.order.metadata
        })
        break
      default:
        console.log('orderErrorHandler error', error)
    }
  }
}
