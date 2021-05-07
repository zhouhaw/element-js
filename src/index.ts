import {
  Asset,
  ECSignature,
  FeeMethod,
  HowToCall,
  Network,
  Order,
  OrderJSON,
  OrderSide,
  SaleKind,
  UnhashedOrder,
  ElementSchemaName
} from './types'

import {
  NULL_ADDRESS,
  encodeBuy,
  encodeSell,
  generatePseudoRandomSalt,
  getOrderHash,
  getPriceParameters,
  getSchema,
  getTimeParameters,
  getTokenList,
  getElementAsset,
  makeBigNumber,
  orderCanMatch,
  orderParamsEncode,
  orderSigEncode,
  orderToJSON,
  registerProxy,
  signOrderHash,
  validateOrder
} from './utils'

import {
  Contracts
} from "./contracts"


export { ElementSchemaName, Network, getTokenList }

export class Orders extends Contracts{
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
    await registerProxy(this.exchangeProxyRegistry, accountAddress)

    // aprove token
    if (paymentTokenAddress !== NULL_ADDRESS) {
      const aproveToken = this.erc20.clone()
      aproveToken.options.address = paymentTokenAddress
      // accountAddress, addressToApprove
      const amount = await aproveToken.methods.allowance(accountAddress, this.tokenTransferProxyAddr).call()
      if (amount < startAmount) {
        const txHash = await aproveToken.methods.aprrove(this.tokenTransferProxyAddr, -1).send({ from: accountAddress })
        console.log(txHash)
      }
    }

    const buyOrder = await this._makeBuyOrder({
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
    // orderParamOk = await this.exchangeHelper.methods.validateOrder(buyOrderParamArray,buyOrderSigArray).call()

    if (sellIsValid && buyIsValid) {
      const sellOrderParamArray = orderParamsEncode(sellOrder)
      const sellOrderSigArray = orderSigEncode(sellOrder)

      const buyOrderParamArray = orderParamsEncode(buyOrderWithSignature)
      const buyOrderSigArray = orderSigEncode(buyOrderWithSignature)

      let isMatch = orderCanMatch(buyOrderWithSignature, sellOrder)
      let canMatch = await this.exchangeHelper.methods.ordersCanMatch(buyOrderParamArray, sellOrderParamArray).call()
      console.log('canMatch', isMatch,canMatch)
      if (!canMatch&&!isMatch) {
        return false
      }

      console.log("buyOrderParamArray",buyOrderParamArray)
      console.log("sellOrderParamArray",sellOrderParamArray)

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
      console.log('exchange.methods.orderMatch', matchTx)
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

    const buyOrder = await this._makeBuyOrder({
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

  public async _makeBuyOrder({
                               asset,
                               quantity,
                               accountAddress,
                               startAmount,
                               expirationTime = 0,
                               paymentTokenAddress,
                               extraBountyBasisPoints = 0,
                               sellOrder,
                               referrerAddress
                             }: {
    asset: Asset
    quantity: number
    accountAddress: string
    startAmount: number
    expirationTime: number
    paymentTokenAddress: string
    extraBountyBasisPoints: number
    sellOrder?: Order
    referrerAddress?: string
  }): Promise<UnhashedOrder> {
    const schema = getSchema(this.networkName, asset.schemaName)
    const quantityBN = makeBigNumber(quantity) // WyvernProtocol.toBaseUnitAmount(makeBigNumber(quantity), asset.decimals || 0)

    const wyAsset = getElementAsset(schema, asset, quantityBN)

    const taker = sellOrder ? sellOrder.maker : NULL_ADDRESS

    // OrderSide.Buy
    const feeRecipient = NULL_ADDRESS
    const feeMethod = FeeMethod.SplitFee

    console.log(wyAsset)

    const { target, dataToCall, replacementPattern } = encodeBuy(schema, wyAsset, accountAddress)

    const { basePrice, extra, paymentToken } = getPriceParameters(
      this.networkName,
      OrderSide.Buy,
      paymentTokenAddress,
      expirationTime,
      startAmount
    )
    const times = getTimeParameters(expirationTime)

    return {
      exchange: this.exchange._address,
      maker: accountAddress,
      taker,
      quantity: quantityBN,
      makerRelayerFee: makeBigNumber(250),
      takerRelayerFee: makeBigNumber(0),
      makerProtocolFee: makeBigNumber(0),
      takerProtocolFee: makeBigNumber(0),
      makerReferrerFee: makeBigNumber(0),
      waitingForBestCounterOrder: false,
      feeMethod,
      feeRecipient,
      side: OrderSide.Buy,
      saleKind: SaleKind.FixedPrice,
      target,
      howToCall: HowToCall.Call,
      dataToCall,
      replacementPattern,
      staticTarget: NULL_ADDRESS,
      staticExtradata: '0x',
      paymentToken,
      basePrice,
      extra,
      listingTime: times.listingTime,
      expirationTime: times.expirationTime,
      salt: generatePseudoRandomSalt(),
      metadata: {
        asset: wyAsset,
        schema: schema.name as ElementSchemaName,
        referrerAddress
      }
    }
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
    const order = await this._makeSellOrder({
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

    // console.log('order ', order, order.salt.toString())

    const orderHash = await getOrderHash(this.web3, this.exchangeHelper, order)
    // console.log('hashOrder', orderHash)
    // orderHash = hashOrder(this.web3, order)
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

  public async _makeSellOrder({
                                asset,
                                quantity,
                                accountAddress,
                                startAmount,
                                endAmount,
                                listingTime,
                                expirationTime,
                                waitForHighestBid,
                                englishAuctionReservePrice = 0,
                                paymentTokenAddress,
                                extraBountyBasisPoints,
                                buyerAddress
                              }: {
    asset: Asset
    quantity: number
    accountAddress: string
    startAmount: number
    endAmount?: number
    waitForHighestBid: boolean
    englishAuctionReservePrice?: number
    listingTime?: number
    expirationTime: number
    paymentTokenAddress: string
    extraBountyBasisPoints: number
    buyerAddress: string
  }): Promise<UnhashedOrder> {
    // accountAddress = validateAndFormatWalletAddress(this.web3, accountAddress)
    const schema = getSchema(this.networkName, asset.schemaName)

    const quantityBN = makeBigNumber(quantity)
    const wyAsset = getElementAsset(schema, asset, quantityBN)

    console.log("_makeSellOrder",wyAsset)
    // const isPrivate = buyerAddress !== NULL_ADDRESS

    const { target, dataToCall, replacementPattern } = encodeSell(schema, wyAsset, accountAddress)

    const orderSaleKind =
      endAmount !== undefined && endAmount !== startAmount ? SaleKind.DutchAuction : SaleKind.FixedPrice

    const { basePrice, extra, paymentToken, reservePrice } = getPriceParameters(
      this.networkName,
      OrderSide.Sell,
      paymentTokenAddress,
      expirationTime,
      startAmount,
      endAmount,
      waitForHighestBid,
      englishAuctionReservePrice
    )
    const times = getTimeParameters(expirationTime, listingTime, waitForHighestBid)

    const feeRecipient = accountAddress
    const feeMethod = FeeMethod.SplitFee

    return {
      exchange: this.exchange._address,
      maker: accountAddress,
      taker: buyerAddress,
      quantity: quantityBN,
      makerRelayerFee: makeBigNumber(250),
      takerRelayerFee: makeBigNumber(0),
      makerProtocolFee: makeBigNumber(0),
      takerProtocolFee: makeBigNumber(0),
      makerReferrerFee: makeBigNumber(0),
      waitingForBestCounterOrder: waitForHighestBid,
      englishAuctionReservePrice: reservePrice ? makeBigNumber(reservePrice) : undefined,
      feeMethod,
      feeRecipient,
      side: OrderSide.Sell,
      saleKind: orderSaleKind,
      target,
      howToCall: HowToCall.Call,
      dataToCall,
      replacementPattern,
      staticTarget: NULL_ADDRESS,
      staticExtradata: '0x',
      paymentToken,
      basePrice,
      extra,
      listingTime: times.listingTime,
      expirationTime: times.expirationTime,
      salt: generatePseudoRandomSalt(),
      metadata: {
        asset: wyAsset,
        schema: schema.name as ElementSchemaName
      }
    }
  }
}

if (typeof window !== 'undefined') {
  (window as any).ElementOrders = Orders;
  (window as any).ElementSchemaName = ElementSchemaName;
  (window as any).Network = Network;
  (window as any).getTokenList = getTokenList
} else {
  (global as any).ElementOrders = Orders;
  (global as any).ElementSchemaName = ElementSchemaName;
  (global as any).Network = Network;
  (global as any).getTokenList = getTokenList
}
