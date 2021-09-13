import { BigNumber, NULL_ADDRESS } from './constants'

import { Order, OrderSide, SaleKind } from '../types'

export async function Sleep(ms: number) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ status: 'wakeUp' })
    }, ms)
  })
}

export const orderFromJSON = (order: any): Order => {
  const createdDate = new Date() // `${order.created_date}Z`
  const orderHash = order.hash || order.orderHash
  const fromJSON: Order = {
    hash: orderHash,
    cancelledOrFinalized: order.cancelled || order.finalized,
    markedInvalid: order.marked_invalid,
    metadata: order.metadata,
    quantity: new BigNumber(order.quantity || 1),
    exchange: order.exchange,
    makerAccount: order.maker,
    takerAccount: order.taker,
    // Use string address to conform to Element Order schema
    maker: order.maker,
    taker: order.taker,
    makerRelayerFee: new BigNumber(order.makerRelayerFee),
    takerRelayerFee: new BigNumber(order.takerRelayerFee),
    makerProtocolFee: new BigNumber(order.makerProtocolFee),
    takerProtocolFee: new BigNumber(order.takerProtocolFee),
    makerReferrerFee: new BigNumber(order.makerReferrerFee || 0),
    waitingForBestCounterOrder: order.feeRecipient == NULL_ADDRESS,
    feeMethod: order.feeMethod,
    feeRecipientAccount: order.feeRecipient,
    feeRecipient: order.feeRecipient,
    side: order.side,
    saleKind: order.saleKind,
    target: order.target,
    howToCall: order.howToCall,
    dataToCall: order.dataToCall,
    replacementPattern: order.replacementPattern,
    staticTarget: order.staticTarget,
    staticExtradata: order.staticExtradata,
    paymentToken: order.paymentToken,
    basePrice: new BigNumber(order.basePrice),
    extra: new BigNumber(order.extra),
    currentBounty: new BigNumber(order.currentBounty || 0),
    currentPrice: new BigNumber(order.currentPrice || 0),

    createdTime: new BigNumber(Math.round(createdDate.getTime() / 1000)),
    listingTime: new BigNumber(order.listingTime),
    expirationTime: new BigNumber(order.expirationTime),

    salt: new BigNumber(order.salt),
    v: Number.parseInt(order.v),
    r: order.r,
    s: order.s,

    paymentTokenContract: order.paymentToken || undefined,
    asset: order.asset || undefined,
    assetBundle: order.assetBundle || undefined
  }

  // Use client-side price calc, to account for buyer fee (not added by server) and latency
  // fromJSON.currentPrice = estimateCurrentPrice(fromJSON)

  return fromJSON
}
