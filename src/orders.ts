import { Asset, ECSignature, Order, OrderJSON } from './types'
import { NULL_ADDRESS, NULL_BLOCK_HASH } from './utils/constants'
import { checkSellUser, checkBuyUser, checkMatchOrder } from './utils/check'
import { ElementError } from './base/error'

import {
  _makeBuyOrder,
  _makeSellOrder,
  _makeMatchingOrder,
  assignOrdersToSides,
  orderParamsEncode,
  orderSigEncode,
  hashAndValidateOrder,
  getOrderHash,
  signOrderHash,
  makeBigNumber
} from './utils/markOrder'

import { Contracts } from './contracts'
// import { orderFromJSON } from '@utils/orders/src/utils'

// export enum OrderCheckPoints {
//   OrderHashSign = 'orderHashSign',
//   TokenApprove = 'tokenApprove',
//   ETHBalance = 'ethBalance',
//   NFTBalance = 'nftBalance'
// }

export enum OrderCheckStatus {
  StartOrderHashSign = 'startOrderHashSign',
  EndOrderHashSign = 'endOrderHashSign',
  StartOrderMatch = 'startOrderMatch',
  EndOrderMatch = 'endOrderMatch'
}

// export type CallBackFunc = (arg: OrderCheckPoints) => OrderCheckStatus

export interface CallBack {
  next<T>(arg: T): OrderCheckStatus
}

export class Orders extends Contracts {
  // 完成买单
  public async fulfillOrder({
    signedOrder,
    accountAddress
  }: {
    signedOrder: Order
    accountAddress: string
  }): Promise<boolean> {
    let networkName = this.networkName
    const matchingOrder = _makeMatchingOrder({
      networkName,
      signedOrder,
      accountAddress
    })

    // let hash = await getOrderHash(this.web3, this.exchangeHelper, matchingOrder)

    // 伪造买单 Buy
    let unsignData = { ...matchingOrder, hash: signedOrder.hash }
    const { buy, sell } = assignOrdersToSides(signedOrder, unsignData)

    console.log('fulfillOrder', 'buy', buy, 'sell', sell)
    return this.orderMatch({ buy, sell, accountAddress })
  }

  public async fulfillBuyOrder({
    signedBuyOrder,
    accountAddress
  }: {
    signedBuyOrder: Order
    accountAddress: string
  }): Promise<boolean> {
    let networkName = this.networkName
    const matchingOrder = _makeMatchingOrder({
      networkName,
      signedOrder: signedBuyOrder,
      accountAddress
    })

    // const hash = await getOrderHash(this.web3, this.exchangeHelper, matchingOrder)
    //
    // // 伪造卖单  Sell
    // let hashedOrder = { ...matchingOrder, hash:signedBuyOrder.hash }

    // let signature: ECSignature
    // if (this.web3.eth.defaultAccount.toLowerCase() == accountAddress) {
    //   signature = await signOrderHash(this.web3, hashedOrder)
    // } else {
    //   throw new ElementError({ code: '1000', message: 'web3.eth.defaultAccount and maker not equal' })
    // }
    // const sell = orderFromJSON({ ...matchingOrder, hash, ...signature })
    // const buy = signedBuyOrder

    // const { buy, sell } = assignOrdersToSides(signedBuyOrder, unsignData)

    // 伪造卖单  Sell
    let unsignData = { ...matchingOrder, hash: signedBuyOrder.hash }
    const { buy, sell } = assignOrdersToSides(signedBuyOrder, unsignData)
    console.log('fulfillBuyOrder', 'buy', buy, 'sell', sell)
    return this.matchOrder({ buy, sell, accountAddress })
  }

  public async matchOrder(
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
  ): Promise<boolean> {
    await checkMatchOrder(this, buy, sell, accountAddress)
    return this.orderMatch({ buy, sell, accountAddress })
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
  ): Promise<boolean> {
    // await checkMatchOrder(this, buy, sell, accountAddress)

    const sellOrderParamArray = orderParamsEncode(sell)
    const sellOrderSigArray = orderSigEncode(sell)
    const buyOrderParamArray = orderParamsEncode(buy)
    const buyOrderSigArray = orderSigEncode(buy)

    callBack?.next(OrderCheckStatus.StartOrderMatch)

    const matchTx = await this.exchange.methods
      .orderMatch(buyOrderParamArray, buyOrderSigArray, sellOrderParamArray, sellOrderSigArray, metadata)
      .send({
        value: buy.paymentToken !== NULL_ADDRESS ? 0 : buy.basePrice,
        from: accountAddress,
        gas: (80e4).toString()
      })
      .catch((error: any) => {
        console.log(error)
        throw new ElementError({ code: '1000', message: 'OrderMatch failure' })
        // console.error('orderMatch', error.receipt) //, error.message
      })
    callBack?.next(OrderCheckStatus.EndOrderMatch)

    if (matchTx) {
      return matchTx.status
    } else {
      return false
    }
  }

  public async createBuyOrder(
    {
      asset,
      accountAddress,
      startAmount,
      quantity = 1,
      expirationTime = 0,
      paymentTokenAddress = this.WETHAddr,
      sellOrder,
      referrerAddress,
      feeRecipient
    }: {
      asset: Asset
      accountAddress: string
      startAmount: number
      quantity?: number
      expirationTime?: number
      paymentTokenAddress?: string
      sellOrder?: Order
      referrerAddress?: string
      feeRecipient?: string
    },
    callBack?: CallBack
  ): Promise<OrderJSON | boolean> {
    await checkBuyUser(this, paymentTokenAddress, accountAddress)

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
      paymentTokenAddress,
      extraBountyBasisPoints: 0,
      sellOrder,
      referrerAddress
    })

    if (feeRecipient) {
      buyOrder.feeRecipient = feeRecipient
    }

    callBack?.next(OrderCheckStatus.StartOrderHashSign)

    let signBuyOrder = await hashAndValidateOrder(this.web3, this.exchangeHelper, buyOrder)

    callBack?.next(OrderCheckStatus.EndOrderHashSign)

    return signBuyOrder
  }

  public async createSellOrder(
    {
      asset,
      accountAddress,
      startAmount,
      endAmount,
      quantity = 1,
      listingTime,
      expirationTime = 0,
      waitForHighestBid = false,
      englishAuctionReservePrice,
      paymentTokenAddress = NULL_ADDRESS,
      extraBountyBasisPoints = 0,
      feeRecipient,
      buyerAddress,
      buyerEmail
    }: {
      asset: Asset
      accountAddress: string
      startAmount: number
      endAmount?: number
      quantity?: number
      listingTime?: number
      expirationTime?: number
      waitForHighestBid?: boolean
      englishAuctionReservePrice?: number
      paymentTokenAddress?: string
      extraBountyBasisPoints?: number
      feeRecipient?: string
      buyerAddress?: string
      buyerEmail?: string
    },
    callBack?: CallBack
  ): Promise<OrderJSON | boolean> {
    if (paymentTokenAddress == '') {
      paymentTokenAddress = NULL_ADDRESS
    }
    expirationTime = expirationTime ? parseInt(String(expirationTime)) : expirationTime
    await checkSellUser(this, asset, paymentTokenAddress, accountAddress)

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
      paymentTokenAddress: paymentTokenAddress || NULL_ADDRESS,
      extraBountyBasisPoints,
      buyerAddress: buyerAddress || NULL_ADDRESS
    })

    if (feeRecipient) {
      sellOrder.feeRecipient = feeRecipient
      sellOrder.takerRelayerFee = sellOrder.makerRelayerFee
      sellOrder.makerRelayerFee = makeBigNumber(0)
    }

    callBack?.next(OrderCheckStatus.StartOrderHashSign)

    let signSellOrder = await hashAndValidateOrder(this.web3, this.exchangeHelper, sellOrder)

    callBack?.next(OrderCheckStatus.EndOrderHashSign)

    return signSellOrder
  }

  public async cancelOrder({ order, accountAddress }: { order: Order; accountAddress: string }): Promise<boolean> {
    if (order.maker.toLowerCase() != accountAddress.toLowerCase()) {
      throw new ElementError({ code: '1000', message: 'CancelOrder order.maker not equle accountAddress' })
    }
    const orderParamArray = orderParamsEncode(order)
    const orderSigArray = orderSigEncode(order)
    const cancelTx = await this.exchange.methods
      .cancelOrder(orderParamArray, orderSigArray)
      .send({
        from: order.maker,
        gas: (80e4).toString()
      })
      .catch((error: any) => {
        throw new ElementError({ code: '1000', message: 'CancelOrder failure' })
        // console.error(error.receipt) //, error.message
      })
    return cancelTx.status
  }
}
