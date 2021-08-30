import { ElementError } from './base/error'
import { Contracts } from './contracts'
import { Asset, ElementAPIConfig, ElementSchemaName, ExchangeMetadata, Network, UnsignedOrder } from './types'
import { EthApi, Web3 } from './api/ethApi'
import { encodeParamsCall } from './schema'
import { MAX_UINT_256 } from './utils/constants'
import { common, getApproveSchemas, getIsApproveSchemas, getTransferSchemas } from './schema/schemas'
import { AnnotatedFunctionOutput, LimitedCallSpec } from './schema/types'

// 根据 DB签名过的订单 make一个对手单
export class Account extends Contracts {
  public ethApi: EthApi
  public elementAccount: string
  public accountProxy: ''
  public Erc20Func
  public ElementRegistryFunc
  public proxyRegistry
  public tokenTransferProxy

  constructor(web3: Web3, apiConfig: ElementAPIConfig = { networkName: Network.Rinkeby }) {
    super(web3, apiConfig)
    this.elementAccount = apiConfig.account || web3.eth.defaultAccount?.toLowerCase() || ''
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.ethApi = new EthApi(web3.currentProvider.host)
    this.networkName = apiConfig.networkName
    this.Erc20Func = common.ERC20Schema.functions
    this.ElementRegistryFunc = common.ElementSchemas.registry.functions
    this.proxyRegistry = this.contractsAddr.ElementixProxyRegistry
    // await this.exchange.methods.tokenTransferProxy().call()
    this.tokenTransferProxy = this.contractsAddr.ElementixTokenTransferProxy
    this.accountProxy = ''
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

  public async getOrderApprove(order: UnsignedOrder): Promise<any> {
    const maker = this.elementAccount
    return {
      isRegister: false,
      isPayTokenApprove: false,
      isSellAssetApprove: false,
      isFeeTokenApprove: false,
      transferProxy: this.tokenTransferProxy
    }
  }

  public async getAccountProxy() {
    const owner = this.elementAccount
    const address = this.proxyRegistry
    if (this.accountProxy === '') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const accountApprove = this.ElementRegistryFunc.isApprove({ address })
      const data = encodeParamsCall(accountApprove, { owner })
      const callData = { to: accountApprove.target, data }
      this.accountProxy = await this.ethCall(callData, accountApprove?.outputs)
    }
    return this.accountProxy
  }

  public async registerProxy() {
    const to = this.proxyRegistry
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const accountApprove = this.ElementRegistryFunc.transfer()
    const data = encodeParamsCall(accountApprove, {})
    const callData = { to, data }
    return this.ethSend(callData)
  }

  public async checkTokenTransferProxy(to: string): Promise<string> {
    const tokenProxy = this.tokenTransferProxy
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const accountApprove = this.Erc20Func.isApprove()
    const data = encodeParamsCall(accountApprove, { owner: this.elementAccount, replace: tokenProxy })
    const callData = { to, data }
    return this.ethCall(callData, accountApprove?.outputs)
  }

  public async getTokenBalances(to: string): Promise<string> {
    const owner = this.elementAccount
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const accountBal = this.Erc20Func.countOf()
    const data = encodeParamsCall(accountBal, { owner })
    const callData = { to, data }
    return this.ethCall(callData, accountBal?.outputs)
  }

  public async approveTokenTransferProxy(to: string): Promise<any> {
    const tokenProxy = this.tokenTransferProxy
    const quantity = MAX_UINT_256.toString()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const accountApprove = this.Erc20Func.approve({ quantity })
    const data = encodeParamsCall(accountApprove, { replace: tokenProxy })
    const callData = { to, data }
    return this.ethSend(callData)
  }

  public async checkAssetTransferProxy(metadata: ExchangeMetadata): Promise<boolean> {
    const owner = this.elementAccount
    const operator = this.tokenTransferProxy
    const accountApprove = getIsApproveSchemas(metadata)
    const data = encodeParamsCall(accountApprove, { owner, replace: operator })
    const callData = { to: accountApprove.target, data }
    const res = await this.ethCall(callData, accountApprove?.outputs)
    const isAddr = accountApprove?.outputs.some((val) => val.type == 'address')
    if (isAddr) {
      // 授权地址是否和 proxy一致
      return res.toLowerCase() === operator.toLowerCase()
    }
    return res
  }

  public async approveAssetTransferProxy(metadata: ExchangeMetadata): Promise<any> {
    const operator = this.tokenTransferProxy
    const accountApprove = getApproveSchemas(metadata)
    const data = encodeParamsCall(accountApprove, { owner: operator, replace: true })
    const callData = { to: accountApprove.target, data }
    return this.ethSend(callData)
  }

  public async assetTransfer(asset: Asset, to: string): Promise<any> {
    const owner = this.elementAccount
    const accountApprove = getTransferSchemas(asset)
    const data = encodeParamsCall(accountApprove, { owner, replace: to })
    const callData = { to: accountApprove.target, data }
    return this.ethSend(callData)
  }

  public async initApprove(error: ElementError) {
    console.log('orderErrorHandler', error)
    switch (String(error.code)) {
      case '1001': // initialize
        await this.registerProxy()
        break
      case '1101': // 批准任何erc20 token
        await this.approveTokenTransferProxy(error.data.erc20Address)
        break
      case '1102': // checkApproveERC1155TransferProxy
        await this.approveAssetTransferProxy(error.data.order.metadata)
        break
      case '1106': // checkApproveERC721TransferProxy
        await this.approveAssetTransferProxy(error.data.order.metadata)
        break
      case '1108': // CryptoKitties
        await this.approveAssetTransferProxy(error.data.order.metadata)
        // await approveSchemaProxy({
        //   contract: this,
        //   orderMetadata: error.data.order.metadata
        // })
        break
      default:
        console.log('orderErrorHandler error', error)
    }
  }
}
