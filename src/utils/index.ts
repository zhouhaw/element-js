import { BigNumber, NULL_ADDRESS, INVERSE_BASIS_POINT } from './constants'

import { Order, OrderSide, SaleKind } from '../types'

import { toBaseUnitAmount, makeBigNumber } from './markOrder'

export const orderFromJSON = (order: any): Order => {
  const createdDate = new Date() // `${order.created_date}Z`
  const fromJSON: Order = {
    hash: order.hash,
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

export async function transferFromERC1155(
  nftsContract: any,
  from: string,
  to: string,
  tokenId: any,
  amount: number = 1
): Promise<boolean> {
  let tx = await nftsContract.methods.safeTransferFrom(from, to, tokenId, amount, '0x').send({ from: from })
  return tx.status
}

export async function transferFromERC721(
  nftsContract: any,
  from: string,
  to: string,
  tokenId: any,
  amount: number = 1
): Promise<boolean> {
  let tx = await nftsContract.methods.safeTransferFrom(from, to, tokenId, amount, '0x').send({ from: from })
  return tx.status
}

export async function transferFromWETH(WETHContract: any, account: string, amount: number) {
  let sellBal = await WETHContract.methods.balanceOf(account).call()
  if (Number(sellBal) < 1e18) {
    await WETHContract.methods.deposit().send({
      from: account,
      value: toBaseUnitAmount(makeBigNumber(amount), 18)
    })
    sellBal = await WETHContract.methods.balanceOf(account).call()
  }
}

export function estimateCurrentPrice(order: Order, secondsToBacktrack = 30, shouldRoundUp = true): BigNumber {
  let { basePrice, listingTime, expirationTime, extra } = order
  const { side, takerRelayerFee, saleKind } = order

  const now = new BigNumber(Math.round(Date.now() / 1000)).minus(secondsToBacktrack)
  basePrice = new BigNumber(basePrice)
  listingTime = new BigNumber(listingTime)
  expirationTime = new BigNumber(expirationTime)
  extra = new BigNumber(extra)

  let exactPrice = basePrice

  if (saleKind === SaleKind.FixedPrice) {
    // Do nothing, price is correct
  } else if (saleKind === SaleKind.DutchAuction) {
    const diff = extra.times(now.minus(listingTime)).dividedBy(expirationTime.minus(listingTime))

    exactPrice =
      side === OrderSide.Sell
        ? /* Sell-side - start price: basePrice. End price: basePrice - extra. */
          basePrice.minus(diff)
        : /* Buy-side - start price: basePrice. End price: basePrice + extra. */
          basePrice.plus(diff)
  }

  // Add taker fee only for buyers
  if (side === OrderSide.Sell && !order.waitingForBestCounterOrder) {
    // Buyer fee increases sale price
    exactPrice = exactPrice.times(+takerRelayerFee / INVERSE_BASIS_POINT + 1)
  }

  return shouldRoundUp ? exactPrice.abs() : exactPrice
}
