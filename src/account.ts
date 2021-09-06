import { ElementError } from './base/error'
import { ContractSchemas } from './contracts/index'
import {
  Asset,
  ETHSending,
  PromiEvent,
  TransactionReceipt,
  BuyOrderApprove,
  ECSignature,
  ElementAPIConfig,
  ExchangeMetadata,
  Network,
  Order,
  OrderJSON,
  OrderSide,
  SellOrderApprove,
  UnhashedOrder,
  UnsignedOrder
} from './types'
import { EthApi, Web3 } from './api/restful/ethApi'
import {
  encodeParamsCall,
  encodeWeb3Call,
  getBalanceSchemas,
  getApproveSchemas,
  getIsApproveSchemas,
  getTransferSchemas,
  LimitedCallSpec
} from './schema'
import { BigNumber, MAX_UINT_256, NULL_ADDRESS } from './utils/constants'

import { orderParamsEncode, orderSigEncode } from './utils/helper'

// 根据 DB签名过的订单 make一个对手单
export class Account extends ContractSchemas {
  // public ethApi: EthApi
  public elementAccount: string
  public accountProxy = NULL_ADDRESS

  constructor(web3: Web3, apiConfig: ElementAPIConfig = { networkName: Network.Rinkeby }) {
    super(web3, apiConfig)
    this.elementAccount = apiConfig.account || web3.eth.defaultAccount?.toLowerCase() || ''
    // this.ethApi = new EthApi(web3.currentProvider.host)
    this.accountProxy = NULL_ADDRESS
  }

  public async getOrderApprove(order: UnsignedOrder | OrderJSON): Promise<SellOrderApprove | BuyOrderApprove> {
    const metadata = order.metadata
    // 检查 Sell 买单
    if (order.side == OrderSide.Sell) {
      const sell: SellOrderApprove = {
        paymentTokenApprove: {
          isApprove: false,
          func: this.approveTokenTransferProxy,
          balances: '0'
        },
        accountRegister: {
          isApprove: false,
          func: this.registerProxy,
          proxy: ''
        },
        sellAssetApprove: {
          isApprove: false,
          func: this.approveAssetTransferProxy,
          balances: '0'
        }
      }
      const proxy = await this.getAccountProxy()
      if (proxy !== NULL_ADDRESS) {
        sell.accountRegister.isApprove = true
        sell.accountRegister.proxy = proxy
      }
      sell.sellAssetApprove.isApprove = await this.checkAssetTransferProxy(metadata)
      sell.sellAssetApprove.balances = await this.getAssetBalances(metadata)
      if (order.paymentToken !== NULL_ADDRESS) {
        const allowance = await this.checkTokenTransferProxy(order.paymentToken)
        sell.paymentTokenApprove.isApprove = new BigNumber(allowance).gte(allowance)
      } else {
        sell.paymentTokenApprove.isApprove = true
      }
      return sell
    } else {
      const buy: BuyOrderApprove = {
        paymentTokenApprove: {
          isApprove: false,
          balances: '',
          func: this.approveTokenTransferProxy
        }
      }
      if (order.paymentToken !== NULL_ADDRESS) {
        const allowance = await this.checkTokenTransferProxy(order.paymentToken)
        buy.paymentTokenApprove.isApprove = new BigNumber(allowance).gte(order.basePrice)
        buy.paymentTokenApprove.balances = await this.getTokenBalances(order.paymentToken)
      } else {
        throw new ElementError({ code: '1204' })
      }
      return buy
    }
  }

  public async getAccountProxy() {
    const owner = this.elementAccount
    const address = this.elementixProxyRegistry
    if (this.accountProxy === NULL_ADDRESS) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const accountApprove = this.ElementRegistryFunc.accountProxy({ address })
      const data = encodeParamsCall(accountApprove, { owner })
      const callData = { to: accountApprove.target, data }
      this.accountProxy = await this.ethCall(callData, accountApprove?.outputs)
    }
    return this.accountProxy
  }

  public async registerProxy() {
    const address = this.elementixProxyRegistry
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const accountApprove = this.ElementRegistryFunc.registerProxy({ address })
    const data = encodeParamsCall(accountApprove, {})
    const callData = { to: accountApprove.target, data }
    return this.ethSend(callData, this.elementAccount)
  }

  public async checkTokenTransferProxy(to: string): Promise<string> {
    const tokenProxy = this.elementixTokenTransferProxy
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const accountApprove = this.Erc20Func.isApprove({ address: to })
    const data = encodeParamsCall(accountApprove, { owner: this.elementAccount, replace: tokenProxy })
    const callData = { to, data }
    return this.ethCall(callData, accountApprove?.outputs)
  }

  public async getTokenBalances(to: string, account?: string): Promise<string> {
    const owner = account || this.elementAccount
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const accountBal = this.Erc20Func.countOf({ address: to })
    const data = encodeParamsCall(accountBal, { owner })
    const callData = { to, data }
    return this.ethCall(callData, accountBal?.outputs)
  }

  public async getAssetBalances(metadata: ExchangeMetadata, account?: string): Promise<string> {
    const owner = account || this.elementAccount
    const accountBal = getBalanceSchemas(metadata)
    const data = encodeParamsCall(accountBal, { owner })
    const callData = { to: accountBal.target, data }
    return this.ethCall(callData, accountBal?.outputs)
  }

  public async approveTokenTransferProxy(to: string): Promise<ETHSending> {
    const tokenProxy = this.elementixTokenTransferProxy
    const quantity = MAX_UINT_256.toString()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const accountApprove = this.Erc20Func.approve({ quantity })
    const data = encodeParamsCall(accountApprove, { replace: tokenProxy })
    const callData = { to, data }
    return this.ethSend(callData, this.elementAccount)
  }

  public async checkAssetTransferProxy(metadata: ExchangeMetadata): Promise<boolean> {
    const owner = this.elementAccount
    const operator = this.elementixTokenTransferProxy
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

  public async approveAssetTransferProxy(
    metadata: ExchangeMetadata
  ): Promise<{ sendTx: PromiEvent<TransactionReceipt>; txHash: string }> {
    const operator = this.elementixTokenTransferProxy
    const accountApprove = getApproveSchemas(metadata)
    const data = encodeParamsCall(accountApprove, { owner: operator, replace: true })
    const callData = { to: accountApprove.target, data }
    return this.ethSend(callData, this.elementAccount)
  }

  // 撮合订单
  public async orderMatch({
    buy,
    sell,
    metadata = '0x'
  }: {
    buy: Order
    sell: Order
    metadata?: string
  }): Promise<ETHSending> {
    const to = this.elementixExchange
    const sellOrderParamArray = orderParamsEncode(sell as UnhashedOrder)
    const sellOrderSigArray = orderSigEncode(sell as ECSignature)
    const buyOrderParamArray = orderParamsEncode(buy as UnhashedOrder)
    const buyOrderSigArray = orderSigEncode(buy as ECSignature)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const accountApprove = this.ElementExchangeFunc.orderMatch({
      address: to
    })
    const data = encodeWeb3Call(accountApprove, [
      buyOrderParamArray,
      buyOrderSigArray,
      sellOrderParamArray,
      sellOrderSigArray,
      metadata
    ])
    const value = buy.paymentToken !== NULL_ADDRESS ? 0 : buy.basePrice
    const callData = { to, data, value } as LimitedCallSpec
    return this.ethSend(callData, this.elementAccount)
  }

  // 取消订单
  public async orderCancel({ order }: { order: Order }): Promise<ETHSending> {
    const to = this.elementixExchange
    const orderParamArray = orderParamsEncode(order)
    const orderSigArray = orderSigEncode(order as ECSignature)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const accountApprove = this.ElementExchangeFunc.orderCancel({
      address: to
    })
    const data = encodeWeb3Call(accountApprove, [orderParamArray, orderSigArray])
    const callData = { to, data }
    return this.ethSend(callData, this.elementAccount)
  }

  public async assetTransfer(metadata: ExchangeMetadata, to: string): Promise<ETHSending> {
    const owner = this.elementAccount
    const accountApprove = getTransferSchemas(metadata)
    const data = encodeParamsCall(accountApprove, { owner, replace: to })
    const callData = { to: accountApprove.target, data }
    return this.ethSend(callData, owner)
  }

  public async accountApprove(error: ElementError) {
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
        break
      default:
        console.log('orderErrorHandler error', error)
    }
  }
}
