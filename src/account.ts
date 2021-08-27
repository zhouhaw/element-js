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

// 根据 DB签名过的订单 make一个对手单
export class Account extends Contracts {
  public ethApi: EthApi
  public elementAccount: string

  constructor(web3: Web3, apiConfig: ElementAPIConfig = { networkName: Network.Rinkeby }) {
    super(web3, apiConfig)
    this.elementAccount = apiConfig.account || web3.eth.defaultAccount?.toLowerCase() || ''
    this.ethApi = new EthApi(web3.givenProvider)
  }

  public async getProxy() {
    const account = this.elementAccount
    const to = this.contractsAddr.ElementixProxyRegistry
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const accountApprove = common.ElementSchemas.functions.isApprove({ account })
    const data = encodeCall(accountApprove, [this.elementAccount])
    // const proxy = await this.exchangeProxyRegistry.methods.proxies(account).encodeABI()
    // console.log(data)
    // console.log(proxy)
    const callData = { to, data }
    return this.web3.eth.call(callData)
  }

  public async registerProxy() {
    const from = this.elementAccount
    const to = this.contractsAddr.ElementixProxyRegistry
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const accountApprove = common.ElementSchemas.functions.approve()
    const data = encodeCall(accountApprove, [])
    // const proxy = await this.exchangeProxyRegistry.methods.registerProxy().encodeABI()
    // console.log(data)
    // console.log(proxy)
    const gas = await this.web3.eth.estimateGas({ to, data })
    const gasPrice = await this.web3.eth.getGasPrice()
    const nonce = await this.web3.eth.getTransactionCount(from)
    const transactionObject = {
      from,
      to,
      value: 0,
      nonce,
      gas,
      gasPrice,
      data
    }
    return this.web3.eth.sendTransaction(transactionObject)
  }

  public async checkTokenTransferProxy(tokenAddr: string) {
    // const from = this.elementAccount
    const account = await this.getProxy()
    const to = await this.exchange.methods.tokenTransferProxy().call()
    // const tokenTransferProxyAddr =
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const accountApprove = common.ERC20Schema.functions.isApprove({ account }, to)
    const data = encodeParamsCall(accountApprove)
    const proxy = await this.erc20.methods.allowance(account, to).encodeABI()
    console.log(data)
    console.log(proxy)
    const callData = { to, data }
    return this.web3.eth.call(callData)
  }

  public async getTokenBalances(tokenAddr: string): Promise<string> {
    const account = this.elementAccount
    const to = tokenAddr
    const erc20Contract = this.erc20.clone()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const accountBal = common.ERC20Schema.functions.countOf({ account })
    const data = encodeParamsCall(accountBal)
    const proxy = await this.erc20.methods.balanceOf(account).encodeABI()
    console.log(data)
    console.log(proxy)
    const callData = { to, data }
    const res = await this.web3.eth.call(callData)

    const params = this.web3.eth.abi.decodeParameters(accountBal?.outputs, res)
    // const decode = decodeCall(accountBal, res).toNumber()
    // erc20Contract.options.address = tokenAddr
    // const decode = await erc20Contract.methods.balanceOf(account).call()
    // console.log(params)
    // console.log(decode)
    // const balance = decodeCall(accountBal, res)[0]
    console.log(params)
    return params.balance
  }

  public async approveTokenTransferProxy(tokenAddr: string) {
    const from = this.elementAccount
    const proxyAccount = await this.getProxy()
    const to = tokenAddr
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const accountApprove = common.ERC20Schema.functions.approve()
    const data = encodeCall(accountApprove, [proxyAccount, MAX_UINT_256.toString()])

    const proxy = await this.erc20.methods.approve(proxyAccount, MAX_UINT_256.toString()).encodeABI()
    // console.log(data)
    // console.log(proxy)
    const gas = await this.web3.eth.estimateGas({ to, data })
    const gasPrice = await this.web3.eth.getGasPrice()
    const nonce = await this.web3.eth.getTransactionCount(from)
    const transactionObject = {
      from,
      to,
      value: 0,
      nonce,
      gas,
      gasPrice,
      data
    }
    return this.web3.eth.sendTransaction(transactionObject)
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
