import { Asset, Order, OrderJSON } from './types'
import { NULL_ADDRESS, NULL_BLOCK_HASH } from './utils/constants'
import { checkSellUser, checkBuyUser, checkMatchOrder } from './utils/check'

import {
  _makeBuyOrder,
  _makeSellOrder,
  orderParamsEncode,
  orderSigEncode,
  hashAndValidateOrder
} from './utils/markOrder'

import { Contracts } from './contracts'

export class Orders extends Contracts {
  public async matchOrder({
    buy,
    sell,
    accountAddress,
    metadata = NULL_BLOCK_HASH
  }: {
    buy: Order
    sell: Order
    accountAddress: string
    metadata?: string
  }): Promise<boolean> {
    await checkMatchOrder(this, buy, sell, accountAddress)

    const sellOrderParamArray = orderParamsEncode(sell)
    const sellOrderSigArray = orderSigEncode(sell)
    const buyOrderParamArray = orderParamsEncode(buy)
    const buyOrderSigArray = orderSigEncode(buy)

    const matchTx = await this.exchange.methods
      .orderMatch(buyOrderParamArray, buyOrderSigArray, sellOrderParamArray, sellOrderSigArray, metadata)
      .send({
        value: buy.paymentToken !== NULL_ADDRESS ? 0 : buy.basePrice,
        from: accountAddress,
        gas: (80e4).toString()
      })
      .catch((error: any) => {
        console.error('orderMatch', error.receipt) //, error.message
      })
    if (matchTx) {
      return matchTx.status
    } else {
      return false
    }
  }

  public async createBuyOrder({
    asset,
    accountAddress,
    startAmount,
    quantity = 1,
    expirationTime = 0,
    paymentTokenAddress = this.WETHAddr,
    sellOrder,
    referrerAddress
  }: {
    asset: Asset
    accountAddress: string
    startAmount: number
    quantity?: number
    expirationTime?: number
    paymentTokenAddress?: string
    sellOrder?: Order
    referrerAddress?: string
  }): Promise<OrderJSON | boolean> {
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

    return hashAndValidateOrder(this.web3, this.exchangeHelper, buyOrder)
  }

  public async createSellOrder({
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
    buyerAddress?: string
    buyerEmail?: string
  }): Promise<OrderJSON | boolean> {
    if (paymentTokenAddress == '') {
      paymentTokenAddress = NULL_ADDRESS
    }
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
    return hashAndValidateOrder(this.web3, this.exchangeHelper, sellOrder)
  }

  public async cancelOrder({ order, accountAddress }: { order: Order; accountAddress: string }): Promise<boolean> {
    if (order.maker.toLowerCase() != accountAddress.toLowerCase()) {
      console.log('order.maker must be accountAddress')
      return false
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
        console.error(error.receipt) //, error.message
      })
    return cancelTx.status
  }
}
