import { Asset, ECSignature, Order, OrderJSON, OrderSide, Token, UnhashedOrder } from './types'
import { NULL_ADDRESS, NULL_BLOCK_HASH } from './utils/constants'
import { checkOrderCancelledOrFinalized, checkMatchOrder, checkUnhashedOrder } from './utils/check'
import { ElementError } from './base/error'

import {
  _makeBuyOrder,
  _makeMatchingOrder,
  _makeSellOrder,
  assignOrdersToSides,
  hashAndValidateOrder
} from './utils/makeOrder'

import { orderParamsEncode, orderSigEncode } from './utils/helper'

import { Contracts } from './contracts'

export enum OrderCheckStatus {
  StartOrderHashSign = 'startOrderHashSign',
  EndOrderHashSign = 'endOrderHashSign',
  StartOrderMatch = 'startOrderMatch',
  OrderMatchTxHash = 'orderMatchTxHash',
  EndOrderMatch = 'endOrderMatch',
  StartCancelOrder = 'startCancelOrder',
  EndCancelOrder = 'endCancelOrder',
  RegisterTxHash = 'registerTxHash',
  EndRegister = 'endRegister',
  ApproveErc20TxHash = 'approveErc20TxHash',
  EndApproveErc20 = 'endApproveErc20',
  ApproveErc721TxHash = 'approveErc721TxHash',
  EndApproveErc721 = 'endApproveErc721',
  ApproveErc1155TxHash = 'approveErc1155TxHash',
  EndApproveErc1155 = 'endApproveErc1155',
  TransferErc1155 = 'transferErc1155',
  TransferErc721 = 'transferErc721',
  End = 'End'
}

export interface CallBack {
  next<T>(arg: OrderCheckStatus, data?: any): OrderCheckStatus
}

export async function Sleep(ms: number) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ status: 'wakeUp' })
    }, ms)
  })
}

// 根据 DB签名过的订单 make一个对手单
export class Orders extends Contracts {
  public makeMatchingOrder(
    {
      signedOrder,
      accountAddress,
      recipientAddress
    }: {
      signedOrder: Order
      accountAddress: string
      recipientAddress?: string
    }
  ) {
    const networkName = this.networkName
    let assetRecipientAddress = recipientAddress
    if (!assetRecipientAddress || signedOrder.side == OrderSide.Buy) {
      assetRecipientAddress = accountAddress
    }
    const feeRecipientAddress = this.feeRecipientAddress

    const matchingOrder = _makeMatchingOrder({
      networkName,
      unSignedOrder: signedOrder,
      accountAddress,
      assetRecipientAddress,
      feeRecipientAddress
    })
    // 伪造买单  对手单
    const unsignData = { ...matchingOrder, hash: signedOrder.hash }
    return assignOrdersToSides(signedOrder, unsignData)
  }

  // 撮合订单
  async orderMatch(
    {
      buy,
      sell,
      accountAddress,
      metadata = NULL_BLOCK_HASH
    }: {
      buy: Order
      sell: Order
      accountAddress: string
      metadata?: string
    },
    callBack?: CallBack
  ): Promise<any> {

    await checkMatchOrder(this, buy, sell)

    const sellOrderParamArray = orderParamsEncode(sell as UnhashedOrder)
    const sellOrderSigArray = orderSigEncode(sell as ECSignature)
    const buyOrderParamArray = orderParamsEncode(buy as UnhashedOrder)
    const buyOrderSigArray = orderSigEncode(buy as ECSignature)
    callBack?.next(OrderCheckStatus.StartOrderMatch, { buy, sell })
    return this.exchange.methods
      .orderMatch(buyOrderParamArray, buyOrderSigArray, sellOrderParamArray, sellOrderSigArray, metadata)
      .send({
        value: buy.paymentToken !== NULL_ADDRESS ? 0 : buy.basePrice,
        from: accountAddress,
        gas: (80e4).toString()
      })
      .on('transactionHash', (txHash: string) => {
        callBack?.next(OrderCheckStatus.OrderMatchTxHash, { txHash, buy, sell, accountAddress })
      })
      .on('receipt', (receipt: string) => {
        callBack?.next(OrderCheckStatus.EndOrderMatch, { receipt, buy, sell })
      })
      .on('error', console.error) // 如果是 out of gas 错误, 第二个参数为交易收据
      .catch((error: any) => {
        if (error.code == '4001') {
          throw new ElementError(error)
        } else {
          throw new ElementError({ code: '1000', message: 'OrderMatch failure' })
        }
      })
  }

  public async creatSignedOrder(
    { unHashOrder }: { unHashOrder: UnhashedOrder },
    callBack?: CallBack
  ): Promise<OrderJSON> {

    await checkUnhashedOrder(this, unHashOrder)

    try {
      callBack?.next(OrderCheckStatus.StartOrderHashSign, { unHashOrder })
      const signSellOrder = await hashAndValidateOrder(this.web3, this.exchangeHelper, unHashOrder)
      callBack?.next(OrderCheckStatus.EndOrderHashSign, { signSellOrder })
      return signSellOrder
    } catch (error) {
      if (error.data) {
        error.data.order = unHashOrder
      } else {
        error = { ...error, message: error.message, data: { order: unHashOrder } }
      }
      throw error
    }
  }

  public async createBuyOrder(
    {
      asset,
      accountAddress,
      startAmount,
      quantity = 1,
      expirationTime = 0,
      paymentTokenObj,
      sellOrder,
      referrerAddress
    }: {
      asset: Asset
      accountAddress: string
      startAmount: number
      quantity?: number
      expirationTime?: number
      paymentTokenObj: Token
      sellOrder?: Order
      referrerAddress?: string
    },
    callBack?: CallBack
  ): Promise<OrderJSON> {
    let networkName = this.networkName
    let exchangeAddr = this.exchange.options.address


    const buyOrder = await _makeBuyOrder({
      networkName,
      exchangeAddr,
      asset,
      quantity,
      accountAddress,
      startAmount,
      expirationTime,
      paymentTokenObj,
      extraBountyBasisPoints: 0,
      feeRecipientAddr: this.feeRecipientAddress,
      sellOrder,
      referrerAddress
    })

    return this.creatSignedOrder({ unHashOrder: buyOrder }, callBack)
  }

  public async createSellOrder(
    {
      asset,
      accountAddress,
      startAmount,
      paymentTokenObj = this.ETH,
      endAmount,
      quantity = 1,
      listingTime,
      expirationTime = 0,
      waitForHighestBid = false,
      englishAuctionReservePrice,
      extraBountyBasisPoints = 0,
      buyerAddress,
      buyerEmail
    }: {
      asset: Asset
      accountAddress: string
      startAmount: number
      paymentTokenObj?: Token
      endAmount?: number
      quantity?: number
      listingTime?: number
      expirationTime?: number
      waitForHighestBid?: boolean
      englishAuctionReservePrice?: number
      extraBountyBasisPoints?: number
      buyerAddress?: string
      buyerEmail?: string
    },
    callBack?: CallBack
  ): Promise<OrderJSON> {
    expirationTime = expirationTime ? parseInt(String(expirationTime)) : expirationTime

    let networkName = this.networkName
    let exchangeAddr = this.exchange.options.address
    const sellOrder = await _makeSellOrder({
      networkName,
      exchangeAddr,
      asset,
      quantity,
      accountAddress,
      startAmount,
      endAmount,
      listingTime,
      expirationTime,
      waitForHighestBid,
      englishAuctionReservePrice,
      paymentTokenObj,
      extraBountyBasisPoints,
      feeRecipientAddr: this.feeRecipientAddress,
      buyerAddress: buyerAddress || NULL_ADDRESS
    })

    return this.creatSignedOrder({ unHashOrder: sellOrder }, callBack)
  }


  public async cancelOrder(
    { order, accountAddress }: { order: Order; accountAddress: string },
    callBack?: CallBack
  ): Promise<any> {
    if (order.maker.toLowerCase() !== accountAddress.toLowerCase()) {
      throw new ElementError({ code: '1000', message: 'CancelOrder order.maker not equle accountAddress' })
    }

    await checkOrderCancelledOrFinalized(this, order)

    const orderParamArray = orderParamsEncode(order)
    const orderSigArray = orderSigEncode(order as ECSignature)
    callBack?.next(OrderCheckStatus.StartCancelOrder)
    return this.exchange.methods
      .cancelOrder(orderParamArray, orderSigArray)
      .send({
        from: order.maker,
        gas: (80e4).toString()
      })
      .on('receipt', (receipt: string) => {
        console.log('receipt：', receipt)
        callBack?.next(OrderCheckStatus.EndCancelOrder, { receipt, order })
      })
      .on('error', console.error) // 如果是 out of gas 错误, 第二个参数为交易收据
      .catch((error: any) => {
        if (error.code == '4001') {
          throw new ElementError(error)
        } else {
          throw new ElementError({ code: '1000', message: 'CancelOrder failure' })
        }
      })
  }
}
