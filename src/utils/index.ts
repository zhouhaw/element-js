import BigNumber from 'bignumber.js'

BigNumber.config({ EXPONENTIAL_AT: 1e9 })
import {
  Network,
  Asset,
  ECSignature,
  ElementAsset,
  ElementSchemaName,
  Order,
  OrderJSON,
  OrderSide,
  SaleKind,
  UnhashedOrder,
  UnsignedOrder
} from '../types'

import { schemas, tokens, encodeBuy, encodeSell } from '../schema'

export { schemas, encodeBuy, encodeSell }
export {
  registerProxy,
  getTokenIDOwner,
  getAccountBalance,
  getAccountNFTsBalance,
  approveTokenTransferProxy,
  approveERC1155TransferProxy,
  approveERC721TransferProxy,
  checkSenderOfAuthenticatedProxy
} from './check'
export { _makeBuyOrder, _makeSellOrder, getTokenList, getSchemaList } from './order'

export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'
export const MAX_DIGITS_IN_UNSIGNED_256_INT = 78 // 78 solt
export const MAX_UINT_256 = new BigNumber(2).pow(256).minus(1) // approve

export function orderParamsEncode(order: any) {
  const orderParamKeys = [
    'exchange',
    'maker',
    'taker',
    'makerRelayerFee',
    'takerRelayerFee',
    'makerProtocolFee',
    'takerProtocolFee',
    'feeRecipient',
    'feeMethod',
    'side',
    'saleKind',
    'target',
    'howToCall',
    'dataToCall',
    'replacementPattern',
    'staticTarget',
    'staticExtradata',
    'paymentToken',
    'basePrice',
    'extra',
    'listingTime',
    'expirationTime',
    'salt'
  ]
  const orerParamValueArray = []
  for (const key of orderParamKeys) {
    let val = order[key]
    if (BigNumber.isBigNumber(val)) {
      val = val.toString()
    }
    orerParamValueArray.push(val)
  }
  return orerParamValueArray
}

export function orderSigEncode(order: any) {
  const orderSigKeys = ['v', 'r', 's']
  const orderSigValueArray = []
  for (const key of orderSigKeys) {
    orderSigValueArray.push(order[key])
  }
  return orderSigValueArray
}

export async function getOrderHash(web3: any, exchangeHelper: any, order: UnhashedOrder): Promise<any> {
  const orderParamValueArray = orderParamsEncode(order)
  const hash = await exchangeHelper.methods.hashOrder(orderParamValueArray).call()
  // let messageHash = web3.eth.accounts.hashMessage(hash)
  return hash
}

export async function validateOrder(exchangeHelper: any, order: any): Promise<any> {
  const orderParamValueArray = orderParamsEncode(order)
  const orderSigArray = orderSigEncode(order)
  return exchangeHelper.methods.validateOrder(orderParamValueArray, orderSigArray).call()
}

export async function hashAndValidateOrder(web3: any, exchangeHelper: any, order: UnhashedOrder): Promise<any> {
  // const orderHash = await getOrderHash(web3, exchangeHelper, order)
  let orderHash = hashOrder(web3, order)
  const hashedOrder = {
    ...order,
    hash: orderHash
  }
  let signature: ECSignature
  if (web3.eth.defaultAccount.toLowerCase() == hashedOrder.maker.toLowerCase()) {
    signature = await signOrderHash(web3, hashedOrder)
  } else {
    return false
  }

  let orderWithSignature = {
    ...hashedOrder,
    ...signature
  }

  const isValid: boolean = await validateOrder(exchangeHelper, orderWithSignature)
  if (isValid) {
    return orderToJSON(orderWithSignature)
  } else {
    return false
  }
}

let canSettleOrder = (listingTime: any, expirationTime: any) => {
  let now = new Date().getTime() / 1000
  if (BigNumber.isBigNumber(listingTime)) {
    listingTime = listingTime.toNumber()
  } else {
    listingTime = Number(listingTime)
  }

  if (BigNumber.isBigNumber(expirationTime)) {
    expirationTime = expirationTime.toNumber()
  } else {
    expirationTime = Number(expirationTime)
  }
  return listingTime < now && (expirationTime == 0 || now < expirationTime)
}

export function ordersCanMatch(buy: Order, sell: Order) {
  return (
    buy.side == 0 &&
    sell.side == 1 &&
    /* Must use same fee method. */
    buy.feeMethod == sell.feeMethod &&
    /* Must use same payment token. */
    buy.paymentToken == sell.paymentToken &&
    /* Must match maker/taker addresses. */
    (sell.taker == NULL_ADDRESS || sell.taker == buy.maker) &&
    (buy.taker == NULL_ADDRESS || buy.taker == sell.maker) &&
    /* One must be maker and the other must be taker (no bool XOR in Solidity). */
    ((sell.feeRecipient == NULL_ADDRESS && buy.feeRecipient != NULL_ADDRESS) ||
      (sell.feeRecipient != NULL_ADDRESS && buy.feeRecipient == NULL_ADDRESS)) &&
    /* Must match target. */
    buy.target == sell.target &&
    /* Must match howToCall. */
    buy.howToCall == sell.howToCall &&
    /* Buy-side order must be settleable. */
    canSettleOrder(buy.listingTime, buy.expirationTime) &&
    /* Sell-side order must be settleable. */
    canSettleOrder(sell.listingTime, sell.expirationTime)
  )
}

export async function _ordersCanMatch(exchangeHelper: any, buy: Order, sell: Order): Promise<any> {
  const buyOrderParamArray = orderParamsEncode(buy)
  const sellOrderParamArray = orderParamsEncode(sell)
  return exchangeHelper.methods.ordersCanMatch(buyOrderParamArray, sellOrderParamArray).call()
}

export function hashOrder(web3: any, order: any): string {
  return web3.utils
    .soliditySha3(
      { type: 'address', value: order.exchange },
      { type: 'address', value: order.maker },
      { type: 'address', value: order.taker },
      { type: 'uint', value: new BigNumber(order.makerRelayerFee) },
      { type: 'uint', value: new BigNumber(order.takerRelayerFee) },
      { type: 'uint', value: new BigNumber(order.takerProtocolFee) },
      { type: 'uint', value: new BigNumber(order.takerProtocolFee) },
      { type: 'address', value: order.feeRecipient },
      { type: 'uint8', value: order.feeMethod },
      { type: 'uint8', value: order.side },
      { type: 'uint8', value: order.saleKind },
      { type: 'address', value: order.target },
      { type: 'uint8', value: order.howToCall },
      { type: 'bytes', value: order.dataToCall },
      { type: 'bytes', value: order.replacementPattern },
      { type: 'address', value: order.staticTarget },
      { type: 'bytes', value: order.staticExtradata },
      { type: 'address', value: order.paymentToken },
      { type: 'uint', value: new BigNumber(order.basePrice) },
      { type: 'uint', value: new BigNumber(order.extra) },
      { type: 'uint', value: new BigNumber(order.listingTime) },
      { type: 'uint', value: new BigNumber(order.expirationTime) },
      { type: 'uint', value: order.salt }
    )
    .toString('hex')
}

export function validateAndFormatWalletAddress(web3: any, address: string): string {
  if (!address) {
    throw new Error('No wallet address found')
  }
  if (!web3.utils.isAddress(address)) {
    throw new Error('Invalid wallet address')
  }
  if (address === NULL_ADDRESS) {
    throw new Error('Wallet cannot be the null address')
  }
  return address.toLowerCase()
}

export async function signOrderHash(web3: any, hashedOrder: UnsignedOrder): Promise<ECSignature> {
  let signature: ECSignature
  try {
    let signatureRes
    if (typeof window !== 'undefined') {
      signatureRes = await web3.eth.personal.sign(hashedOrder.hash, hashedOrder.maker)
    } else {
      signatureRes = await web3.eth.sign(hashedOrder.hash, hashedOrder.maker)
    }

    const signatureHex = signatureRes.slice(2)
    signature = {
      v: Number.parseInt(signatureHex.slice(128, 130), 16), // The signature is now comprised of r, s, and v.
      r: `0x${signatureHex.slice(0, 64)}`,
      s: `0x${signatureHex.slice(64, 128)}`
    }
  } catch (error) {
    console.error(error)
    throw new Error('You declined to authorize your auction')
  }
  return signature
}

export const orderToJSON = (order: Order): OrderJSON => {
  const asJSON: OrderJSON = {
    exchange: order.exchange.toLowerCase(),
    maker: order.maker.toLowerCase(),
    taker: order.taker.toLowerCase(),
    makerRelayerFee: order.makerRelayerFee.toString(),
    takerRelayerFee: order.takerRelayerFee.toString(),
    makerProtocolFee: order.makerProtocolFee.toString(),
    takerProtocolFee: order.takerProtocolFee.toString(),
    makerReferrerFee: order.makerReferrerFee.toString(),
    feeMethod: order.feeMethod,
    feeRecipient: order.feeRecipient.toLowerCase(),
    side: order.side,
    saleKind: order.saleKind,
    target: order.target.toLowerCase(),
    howToCall: order.howToCall,
    dataToCall: order.dataToCall,
    replacementPattern: order.replacementPattern,
    staticTarget: order.staticTarget.toLowerCase(),
    staticExtradata: order.staticExtradata,
    paymentToken: order.paymentToken.toLowerCase(),
    quantity: order.quantity.toString(),
    basePrice: order.basePrice.toString(),
    extra: order.extra.toString(),
    listingTime: order.listingTime.toString(),
    expirationTime: order.expirationTime.toString(),
    salt: order.salt.toString(),

    metadata: order.metadata,

    v: order.v,
    r: order.r,
    s: order.s,

    hash: order.hash
  }
  return asJSON
}

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
  fromJSON.currentPrice = estimateCurrentPrice(fromJSON)

  return fromJSON
}

const INVERSE_BASIS_POINT = 10000

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
