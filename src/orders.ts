import { Asset, Order, OrderJSON } from './types'

import {
  toBaseUnitAmount,
  NULL_ADDRESS,
  orderParamsEncode,
  orderSigEncode,
  registerProxy,
  validateOrder,
  hashAndValidateOrder,
  ordersCanMatch,
  _makeBuyOrder,
  _makeSellOrder
} from './utils'

import { Contracts } from './contracts'

const NULL_BLOCK_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000'

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
  }) {
    const equalPrice: boolean = buy.basePrice.eq(sell.basePrice)
    if (!equalPrice) {
      console.log('matchOrder:buy.basePrice and sell.basePrice not equal!')
      return false
    }
    const buyIsValid: boolean = await validateOrder(this.exchangeHelper, buy)
    const sellIsValid: boolean = await validateOrder(this.exchangeHelper, sell)
    if (!sellIsValid && !buyIsValid) {
      console.log('matchOrder: validateOrder false')
      return false
    }

    // let canMatch = await ordersCanMatch(buy, sell)
    let canMatch = await ordersCanMatch(this.exchangeHelper, buy, sell)
    if (!canMatch) {
      console.log('matchOrder: canMatch false')
      return false
    }

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
        console.error(error.receipt) //, error.message
        return false
      })
    return matchTx.status
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
    // exchangeProxyRegistry
    await registerProxy(this.exchangeProxyRegistry, accountAddress)

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
    paymentTokenAddress,
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

  public async cancelOrder({ order, accountAddress }: { order: Order; accountAddress: string }) {
    if (order.maker.toLowerCase() != accountAddress.toLowerCase()) {
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
