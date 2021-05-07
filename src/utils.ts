import BigNumber from 'bignumber.js'
import { Network, Schema } from './schema/types'
import { schemas } from './schema/schemas'
import { tokens } from './schema/tokens'
import {
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
} from './types'

export { encodeBuy, encodeSell } from './schema'

BigNumber.config({ EXPONENTIAL_AT: 1e9 })

export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'

export async function registerProxy(
  proxyRegistryContract: any,
  account: string
): Promise<string | boolean> {
  let proxy = await proxyRegistryContract.methods.proxies(account).call()
  if (proxy === NULL_ADDRESS) {
    const rawTxNew = await proxyRegistryContract.methods.registerProxy().send({
      from: account
    })
    return false
  }
  return proxy
}

export function makeBigNumber(arg: number | string | BigNumber): BigNumber {
  // Zero sometimes returned as 0x from contracts
  if (arg === '0x') {
    arg = 0
  }
  // fix "new BigNumber() number type has more than 15 significant digits"
  arg = arg.toString()
  return new BigNumber(arg)
}

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

export async function getOrderHash(
  web3: any,
  exchangeHelper: any,
  order: UnhashedOrder
): Promise<any> {
  const orderParamValueArray = orderParamsEncode(order)
  const hash = await exchangeHelper.methods
    .hashOrder(orderParamValueArray)
    .call()
  // let messageHash = web3.eth.accounts.hashMessage(hash)
  return hash
}

export async function validateOrder(
  exchangeHelper: any,
  order: UnhashedOrder
): Promise<any> {
  const orderParamValueArray = orderParamsEncode(order)
  const orderSigArray = orderSigEncode(order)
  return exchangeHelper.methods
    .validateOrder(orderParamValueArray, orderSigArray)
    .call()
}

let canSettleOrder = (listingTime: BigNumber, expirationTime: BigNumber) => {
  let now = (new Date().getTime()) / 1000
  return (listingTime.toNumber() < now) && (expirationTime.toNumber() == 0 || now < expirationTime.toNumber())
}

export function orderCanMatch(buy: Order, sell: Order) {
  console.log(NULL_ADDRESS)
  return (buy.side == 0 && sell.side == 1) &&
    /* Must use same fee method. */
    (buy.feeMethod == sell.feeMethod) &&
    /* Must use same payment token. */
    (buy.paymentToken == sell.paymentToken) &&
    /* Must match maker/taker addresses. */
    (sell.taker == NULL_ADDRESS || sell.taker == buy.maker) &&
    (buy.taker == NULL_ADDRESS || buy.taker == sell.maker) &&
    /* One must be maker and the other must be taker (no bool XOR in Solidity). */
    ((sell.feeRecipient == NULL_ADDRESS && buy.feeRecipient != NULL_ADDRESS) || (sell.feeRecipient != NULL_ADDRESS && buy.feeRecipient == NULL_ADDRESS)) &&
    /* Must match target. */
    (buy.target == sell.target) &&
    /* Must match howToCall. */
    (buy.howToCall == sell.howToCall) &&
    /* Buy-side order must be settleable. */
    canSettleOrder(buy.listingTime, buy.expirationTime) &&
    /* Sell-side order must be settleable. */
    canSettleOrder(sell.listingTime, sell.expirationTime)
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

export function validateAndFormatWalletAddress(
  web3: any,
  address: string
): string {
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

export function getSchema(
  network: Network,
  schemaName?: ElementSchemaName
): Schema<any> {
  const schemaName_ = schemaName || ElementSchemaName.ERC1155

  // @ts-ignore
  const scahmaList  = schemas[network]
  if (!scahmaList) {
    throw new Error(
      `Trading for this Network (${network}) is not yet supported. Please contact us or check back later!`
    )
  }

  const schemaInfo = scahmaList.find(
    (val: Schema<any>) => val.name === schemaName_
  )

  if (!schemaInfo) {
    throw new Error(
      `Trading for this asset (${schemaName_}) is not yet supported. Please contact us or check back later!`
    )
  }
  return schemaInfo
}

export function getElementAsset(
  schema: Schema<ElementAsset>,
  asset: Asset,
  quantity = new BigNumber(1)
): ElementAsset {
  const tokenId = asset.tokenId != undefined ? asset.tokenId.toString() : undefined

  return schema.assetFromFields({
    ID: tokenId,
    Quantity: quantity.toString(),
    Address: asset.tokenAddress.toLowerCase(),
    Name: asset.name,
    Data: asset.data||"",
  })
}

export function generatePseudoRandomSalt() {
  // BigNumber.random returns a pseudo-random number between 0 & 1 with a passed in number of decimal places.
  // Source: https://mikemcl.github.io/bignumber.js/#random
  const MAX_DIGITS_IN_UNSIGNED_256_INT = 18 // 78
  const randomNumber = BigNumber.random(MAX_DIGITS_IN_UNSIGNED_256_INT)
  const factor = new BigNumber(10).pow(MAX_DIGITS_IN_UNSIGNED_256_INT - 1)
  const salt = randomNumber.times(factor).integerValue()
  return salt
}

function toBaseUnitAmount(amount: BigNumber, decimals: number) {
  const unit = new BigNumber(10).pow(decimals)
  const baseUnitAmount = amount.times(unit).integerValue()
  return baseUnitAmount
}

export function getPriceParameters(
  network: Network,
  orderSide: OrderSide,
  tokenAddress: string,
  expirationTime: number,
  startAmount: number,
  endAmount?: number,
  waitingForBestCounterOrder = false,
  englishAuctionReservePrice?: number
) {
  const priceDiff = endAmount != undefined ? startAmount - endAmount : 0
  const paymentToken = tokenAddress.toLowerCase()
  const isEther = tokenAddress == NULL_ADDRESS
  let token
  if (!isEther) {
    const tokenList = getTokenList(network)
    token = tokenList.find((val) => val.address.toLowerCase() == paymentToken)
  }

  // Validation
  if (isNaN(startAmount) || startAmount == undefined || startAmount < 0) {
    throw new Error(`Starting price must be a number >= 0`)
  }
  if (!isEther && !token) {
    throw new Error(`No ERC-20 token found for '${paymentToken}'`)
  }
  if (isEther && waitingForBestCounterOrder) {
    throw new Error(
      `English auctions must use wrapped ETH or an ERC-20 token.`
    )
  }
  // if (isEther && orderSide === OrderSide.Buy) {
  //   throw new Error(`Offers must use wrapped ETH or an ERC-20 token.`)
  // }
  if (priceDiff < 0) {
    throw new Error('End price must be less than or equal to the start price.')
  }
  if (priceDiff > 0 && expirationTime == 0) {
    throw new Error(
      'Expiration time must be set if order will change in price.'
    )
  }
  if (englishAuctionReservePrice && !waitingForBestCounterOrder) {
    throw new Error('Reserve prices may only be set on English auctions.')
  }
  if (englishAuctionReservePrice && englishAuctionReservePrice < startAmount) {
    throw new Error(
      'Reserve price must be greater than or equal to the start amount.'
    )
  }

  // Note: WyvernProtocol.toBaseUnitAmount(makeBigNumber(startAmount), token.decimals)
  // will fail if too many decimal places, so special-case ether
  const basePrice = isEther
    ? toBaseUnitAmount(makeBigNumber(startAmount), 18)
    : toBaseUnitAmount(makeBigNumber(startAmount), token.decimals)

  const extra = isEther
    ? toBaseUnitAmount(makeBigNumber(priceDiff), 18)
    : toBaseUnitAmount(makeBigNumber(priceDiff), token.decimals)

  const reservePrice = englishAuctionReservePrice

  return { basePrice, extra, paymentToken, reservePrice }
}

export const MIN_EXPIRATION_SECONDS = 10
export const ORDER_MATCHING_LATENCY_SECONDS = 60 * 60 * 24 * 7

export function getTimeParameters(
  expirationTimestamp: number,
  listingTimestamp?: number,
  waitingForBestCounterOrder = false
) {
  // Validation
  const minExpirationTimestamp = Math.round(
    Date.now() / 1000 + MIN_EXPIRATION_SECONDS
  )
  const minListingTimestamp = Math.round(Date.now() / 1000)
  if (
    expirationTimestamp != 0 &&
    expirationTimestamp < minExpirationTimestamp
  ) {
    throw new Error(
      `Expiration time must be at least ${MIN_EXPIRATION_SECONDS} seconds from now, or zero (non-expiring).`
    )
  }
  if (listingTimestamp && listingTimestamp < minListingTimestamp) {
    throw new Error('Listing time cannot be in the past.')
  }
  if (
    listingTimestamp &&
    expirationTimestamp !== 0 &&
    listingTimestamp >= expirationTimestamp
  ) {
    throw new Error('Listing time must be before the expiration time.')
  }
  if (waitingForBestCounterOrder && expirationTimestamp == 0) {
    throw new Error('English auctions must have an expiration time.')
  }
  if (waitingForBestCounterOrder && listingTimestamp) {
    throw new Error(`Cannot schedule an English auction for the future.`)
  }
  if (Number.parseInt(expirationTimestamp.toString()) != expirationTimestamp) {
    throw new Error(`Expiration timestamp must be a whole number of seconds`)
  }

  if (waitingForBestCounterOrder) {
    listingTimestamp = expirationTimestamp
    // Expire one week from now, to ensure server can match it
    // Later, this will expire closer to the listingTime
    expirationTimestamp += ORDER_MATCHING_LATENCY_SECONDS
  } else {
    // Small offset to account for latency
    listingTimestamp = listingTimestamp || Math.round(Date.now() / 1000 - 100)
  }

  return {
    listingTime: makeBigNumber(listingTimestamp),
    expirationTime: makeBigNumber(expirationTimestamp)
  }
}

export async function signOrderHash(
  web3: any,
  hashedOrder: UnsignedOrder
): Promise<ECSignature> {
  let signature: ECSignature
  try {
    // let signatureRes = await web3.eth.personal.sign(hashedOrder.hash, hashedOrder.maker)

    const signatureRes = await web3.eth.sign(hashedOrder.hash, hashedOrder.maker)

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

export async function validateAndPostOrder(
  web3: any,
  order: any
): Promise<any> {
  const hash = hashOrder(web3, order)
  if (hash !== order.hash) {
    console.error(order)
    throw new Error(
      `Order couldn't be validated by the exchange due to a hash mismatch. Make sure your wallet is on the right network!`
    )
  }
  // Validation is called server-side
  // const confirmedOrder = await this.api.postOrder()
  return orderToJSON(order)
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
    // Use string address to conform to Wyvern Order schema
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

export const INVERSE_BASIS_POINT = 10000

export function estimateCurrentPrice(
  order: Order,
  secondsToBacktrack = 30,
  shouldRoundUp = true
): BigNumber {
  let { basePrice, listingTime, expirationTime, extra } = order
  const { side, takerRelayerFee, saleKind } = order

  const now = new BigNumber(Math.round(Date.now() / 1000)).minus(
    secondsToBacktrack
  )
  basePrice = new BigNumber(basePrice)
  listingTime = new BigNumber(listingTime)
  expirationTime = new BigNumber(expirationTime)
  extra = new BigNumber(extra)

  let exactPrice = basePrice

  if (saleKind === SaleKind.FixedPrice) {
    // Do nothing, price is correct
  } else if (saleKind === SaleKind.DutchAuction) {
    const diff = extra
      .times(now.minus(listingTime))
      .dividedBy(expirationTime.minus(listingTime))

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

// ------------Buy----------------

export function getTokenList(network: Network): Array<any> {
  const payTokens = tokens[network]
  return [payTokens.canonicalWrappedEther, ...payTokens.otherTokens]
}
