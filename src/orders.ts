import { Asset, ECSignature, Order, OrderJSON } from './types'

import {
  approveTokenTransferProxy,
  getOrderHash,
  NULL_ADDRESS,
  orderCanMatch,
  orderParamsEncode,
  orderSigEncode,
  orderToJSON,
  registerProxy,
  signOrderHash,
  validateOrder,
  _makeBuyOrder,
  _makeSellOrder
} from './utils'

import { Contracts } from './contracts'

export class Orders extends Contracts {
  public async matchOrder({
    asset,
    accountAddress,
    startAmount,
    quantity = 1,
    expirationTime = 0,
    paymentTokenAddress = NULL_ADDRESS,
    sellOrder,
    referrerAddress
  }: {
    asset: Asset
    accountAddress: string
    startAmount: number
    quantity?: number
    expirationTime?: number
    paymentTokenAddress?: string
    sellOrder: Order
    referrerAddress?: string
  }): Promise<Order | boolean> {
    // check register
    await registerProxy(this.exchangeProxyRegistry, accountAddress)

    // check approve token
    if (paymentTokenAddress !== NULL_ADDRESS) {
      const aproveToken = this.erc20.clone()
      aproveToken.options.address = paymentTokenAddress
      let isTransferApprove = await approveTokenTransferProxy(this.exchange, aproveToken, accountAddress)
      if (!isTransferApprove) {
        return false
      }
    }

    const buyOrder = await _makeBuyOrder({
      networkName: this.networkName,
      exchangeAddr: this.exchange.options.address,
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

    const orderHash = await getOrderHash(this.web3, this.exchangeHelper, buyOrder)

    const hashedOrder = {
      ...buyOrder,
      hash: orderHash
    }

    const signature = await signOrderHash(this.web3, hashedOrder)

    const buyOrderWithSignature: Order = {
      ...hashedOrder,
      ...signature
    }

    const buyIsValid: boolean = await validateOrder(this.exchangeHelper, buyOrderWithSignature)

    const sellIsValid: boolean = await validateOrder(this.exchangeHelper, sellOrder)

    if (sellIsValid && buyIsValid) {
      const sellOrderParamArray = orderParamsEncode(sellOrder)
      const sellOrderSigArray = orderSigEncode(sellOrder)

      const buyOrderParamArray = orderParamsEncode(buyOrderWithSignature)
      const buyOrderSigArray = orderSigEncode(buyOrderWithSignature)

      let isMatch = orderCanMatch(buyOrderWithSignature, sellOrder)
      // let canMatch = await this.exchangeHelper.methods.ordersCanMatch(buyOrderParamArray, sellOrderParamArray).call()
      //
      // if (!canMatch && !isMatch) {
      //   return false
      // }

      // console.log('buyOrderParamArray', buyOrderParamArray)
      // console.log('sellOrderParamArray', sellOrderParamArray)

      const matchTx = await this.exchange.methods
        .orderMatch(
          buyOrderParamArray,
          buyOrderSigArray,
          sellOrderParamArray,
          sellOrderSigArray,
          '0x0000000000000000000000000000000000000000000000000000000000000000'
        )
        .send({
          value: buyOrder.paymentToken !== NULL_ADDRESS ? 0 : buyOrder.basePrice,
          from: buyOrder.maker,
          gas: (80e4).toString()
        })
        .catch((error: any) => {
          console.error(error.receipt) //, error.message
          return false
        })
      console.log('exchange.methods.orderMatch', matchTx.status)
    }
    return true
  }

  // -------------- Buy ---------------------
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

    const orderHash = await getOrderHash(this.web3, this.exchangeHelper, buyOrder)
    // hashOrder(this.web3, order)
    const hashedOrder = {
      ...buyOrder,
      hash: orderHash
    }

    const signature = await signOrderHash(this.web3, hashedOrder)

    const orderWithSignature = {
      ...hashedOrder,
      ...signature
    }

    const isValid: boolean = await validateOrder(this.exchangeHelper, orderWithSignature)
    if (isValid) {
      return orderToJSON(orderWithSignature) // validateAndPostOrder(this.web3, hashedOrder)
    }
    return false
  }

  // ------------- Sell-------------------------
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

    const order = await _makeSellOrder({
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
    const orderHash = await getOrderHash(this.web3, this.exchangeHelper, order)
    const hashedOrder = {
      ...order,
      hash: orderHash
    }

    const signature: ECSignature = await signOrderHash(this.web3, hashedOrder)

    const orderWithSignature: Order = {
      ...hashedOrder,
      ...signature
    }
    const isValid: boolean = await validateOrder(this.exchangeHelper, orderWithSignature)
    if (isValid) {
      return orderToJSON(orderWithSignature) // validateAndPostOrder(this.web3, hashedOrder)
    }
    return false
  }
}
