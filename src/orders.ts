import { Asset, ECSignature, Order, OrderJSON, OrderSide, UnhashedOrder, Token } from './types'
import { NULL_ADDRESS, NULL_BLOCK_HASH } from './utils/constants'
import { _ordersCanMatch, cancelledOrFinalized, checkMatchOrder, checkOrder } from './utils/check'
import { ElementError } from './base/error'

import {
  _makeBuyOrder,
  _makeMatchingOrder,
  _makeSellOrder,
  assignOrdersToSides,
  hashAndValidateOrder
} from './utils/makeOrder'

import { makeBigNumber, orderParamsEncode, orderSigEncode } from './utils/helper'

import { Contracts } from './contracts'

export enum OrderCheckStatus {
  StartOrderHashSign = 'startOrderHashSign',
  EndOrderHashSign = 'endOrderHashSign',
  StartOrderMatch = 'startOrderMatch',
  OrderMatchTxHash = 'orderMatchTxHash',
  EndOrderMatch = 'endOrderMatch',
  StartCancelOrder = 'startCancelOrder',
  EndCancelOrder = 'endCancelOrder',
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

export class Orders extends Contracts {
  public async fulfillOrder(
    {
      signedOrder,
      accountAddress,
      recipientAddress
    }: {
      signedOrder: Order
      accountAddress: string
      recipientAddress?: string
    },
    callBack?: CallBack
  ): Promise<any> {
    const networkName = this.networkName
    let assetRecipientAddress = recipientAddress
    if (!assetRecipientAddress || signedOrder.side == OrderSide.Buy) {
      assetRecipientAddress = accountAddress
    }
    const feeRecipientAddress = this.feeRecipientAddress

    const matchingOrder = _makeMatchingOrder({
      networkName,
      signedOrder,
      accountAddress,
      assetRecipientAddress,
      feeRecipientAddress
    })
    // 伪造买单  对手单
    const unsignData = { ...matchingOrder, hash: signedOrder.hash }

    const { buy, sell } = assignOrdersToSides(signedOrder, unsignData)

    return this.orderMatch({ buy, sell, accountAddress }, callBack)
  }

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
    if (!_ordersCanMatch(buy, sell)) {
      throw new ElementError({ code: '1202' })
    }

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
        callBack?.next(OrderCheckStatus.OrderMatchTxHash, { txHash, buy, sell })
        console.log('Send success tx hash：', txHash)
      })
      .on('confirmation', (confirmationNumber: number, receipt: string) => {
        console.log(' confirmation num：', confirmationNumber)
        console.log(' confirmation receipt：', receipt)
      })
      .on('receipt', (receipt: string) => {
        console.log('receipt：', receipt)
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
  ): Promise<OrderJSON | boolean> {
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
    await checkOrder(this, buyOrder)

    callBack?.next(OrderCheckStatus.StartOrderHashSign, { buyOrder })

    let signBuyOrder = await hashAndValidateOrder(this.web3, this.exchangeHelper, buyOrder)

    callBack?.next(OrderCheckStatus.EndOrderHashSign, { signBuyOrder })

    return signBuyOrder
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
  ): Promise<OrderJSON | boolean> {
    expirationTime = expirationTime ? parseInt(String(expirationTime)) : expirationTime

    let networkName = this.networkName
    let exchangeAddr = this.exchange.options.address

    // let paymentTokenObj =
    //   paymentTokenAddress == NULL_ADDRESS
    //     ? this.ETH
    //     : this.paymentTokenList.find((val) => val.address.toLowerCase() == paymentTokenAddress?.toLowerCase())
    //
    // if (!paymentTokenObj) {
    //   throw new ElementError({ code: '1000', message: `No ERC-20 token found for '${paymentTokenAddress}'` })
    // }

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


    await checkOrder(this, sellOrder)

    callBack?.next(OrderCheckStatus.StartOrderHashSign, { sellOrder })

    let signSellOrder = await hashAndValidateOrder(this.web3, this.exchangeHelper, sellOrder)

    callBack?.next(OrderCheckStatus.EndOrderHashSign, { signSellOrder })

    return signSellOrder
  }

  public async cancelOrder(
    { order, accountAddress }: { order: Order; accountAddress: string },
    callBack?: CallBack
  ): Promise<any> {
    if (order.maker.toLowerCase() != accountAddress.toLowerCase()) {
      throw new ElementError({ code: '1000', message: 'CancelOrder order.maker not equle accountAddress' })
    }

    await cancelledOrFinalized(this.exchange, order.hash).catch((err) => {
      throw new ElementError({ code: '1000', message: 'CancelOrder is success!' })
    })

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
