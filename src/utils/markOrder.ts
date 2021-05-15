import {
  Asset,
  ECSignature,
  ElementAsset,
  ElementSchemaName,
  FeeMethod,
  HowToCall,
  Network,
  Order,
  OrderJSON,
  OrderSide,
  SaleKind,
  UnhashedOrder,
  UnsignedOrder
} from '../types'

// import { schemas, encodeBuy, encodeSell, encodeCall } from '../schema'
import { schemas, encodeBuy, encodeSell } from '../schema'
import { Schema } from '../schema/types'
import { tokens } from '../schema/tokens'
import { ElementError } from '../base/error'
import {
  BigNumber,
  NULL_ADDRESS,
  MAX_DIGITS_IN_UNSIGNED_256_INT,
  MIN_EXPIRATION_SECONDS,
  ORDER_MATCHING_LATENCY_SECONDS
} from './constants'
import { validateOrder } from './check'

export function toBaseUnitAmount(amount: BigNumber, decimals: number): BigNumber {
  const unit = new BigNumber(10).pow(decimals)
  return amount.times(unit).integerValue()
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

export function getSchema(network: Network, schemaName?: ElementSchemaName): Schema<any> {
  const schemaName_ = schemaName || ElementSchemaName.ERC1155

  const schemaInfo = getSchemaList(network, schemaName_) // scahmaList.find((val: Schema<any>) => val.name === schemaName_)

  if (schemaInfo.length == 0) {
    let msg = `Trading for this asset (${schemaName_}) is not yet supported. Please contact us or check back later!`

    throw new ElementError({ code: 1000, message: msg })
  }
  return schemaInfo[0]
}

export function getElementAsset(schema: Schema<ElementAsset>, asset: Asset, quantity = new BigNumber(1)): ElementAsset {
  const tokenId = asset.tokenId != undefined ? asset.tokenId.toString() : undefined

  return schema.assetFromFields({
    ID: tokenId,
    Quantity: quantity.toString(),
    Address: asset.tokenAddress.toLowerCase(),
    Name: asset.name,
    Data: asset.data || ''
  })
}

export function getSchemaAndAsset(networkName: Network, asset: Asset, quantity: number) {
  const schema = getSchema(networkName, asset.schemaName)
  // const quantityBN = makeBigNumber(quantity) // WyvernProtocol.toBaseUnitAmount(makeBigNumber(quantity), asset.decimals || 0)
  const quantityBN = makeBigNumber(quantity)
  const elementAsset = getElementAsset(schema, asset, quantityBN)
  return {
    schema,
    elementAsset,
    quantityBN
  }
}

export function generatePseudoRandomSalt(): BigNumber {
  // BigNumber.random returns a pseudo-random number between 0 & 1 with a passed in number of decimal places.
  // Source: https://mikemcl.github.io/bignumber.js/#random
  const randomNumber = BigNumber.random(MAX_DIGITS_IN_UNSIGNED_256_INT)
  const factor = new BigNumber(10).pow(MAX_DIGITS_IN_UNSIGNED_256_INT - 1)
  return randomNumber.times(factor).integerValue()
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
    throw new ElementError({ code: 1000, message: `Starting price must be a number >= 0` })
  }
  if (!isEther && !token) {
    throw new ElementError({ code: 1000, message: `No ERC-20 token found for '${paymentToken}'` })
  }
  if (isEther && waitingForBestCounterOrder) {
    throw new ElementError({ code: 1000, message: `English auctions must use wrapped ETH or an ERC-20 token.` })
  }
  // if (isEther && orderSide === OrderSide.Buy) {
  //   throw new Error(`Offers must use wrapped ETH or an ERC-20 token.`)
  // }
  if (priceDiff < 0) {
    throw new ElementError({ code: 1000, message: 'End price must be less than or equal to the start price.' })
  }
  if (priceDiff > 0 && expirationTime == 0) {
    throw new ElementError({ code: 1000, message: 'Expiration time must be set if order will change in price.' })
  }
  if (englishAuctionReservePrice && !waitingForBestCounterOrder) {
    throw new ElementError({ code: 1000, message: 'Reserve prices may only be set on English auctions.' })
  }
  if (englishAuctionReservePrice && englishAuctionReservePrice < startAmount) {
    throw new ElementError({ code: 1000, message: 'Reserve price must be greater than or equal to the start amount.' })
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

export function getTimeParameters(
  expirationTimestamp: number,
  listingTimestamp?: number,
  waitingForBestCounterOrder = false
) {
  // Validation
  const minExpirationTimestamp = Math.round(Date.now() / 1000 + MIN_EXPIRATION_SECONDS)
  const minListingTimestamp = Math.round(Date.now() / 1000)
  if (expirationTimestamp != 0 && expirationTimestamp < minExpirationTimestamp) {
    throw new ElementError({
      code: 1000,
      message: `Expiration time must be at least ${MIN_EXPIRATION_SECONDS} seconds from now, or zero (non-expiring).`
    })
  }
  if (listingTimestamp && listingTimestamp < minListingTimestamp) {
    throw new ElementError({ code: 1000, message: 'Listing time cannot be in the past.' })
  }
  if (listingTimestamp && expirationTimestamp !== 0 && listingTimestamp >= expirationTimestamp) {
    throw new ElementError({ code: 1000, message: 'Listing time must be before the expiration time.' })
  }
  if (waitingForBestCounterOrder && expirationTimestamp == 0) {
    throw new ElementError({ code: 1000, message: 'English auctions must have an expiration time.' })
  }
  if (waitingForBestCounterOrder && listingTimestamp) {
    throw new ElementError({ code: 1000, message: `Cannot schedule an English auction for the future.` })
  }
  if (Number.parseInt(expirationTimestamp.toString()) != expirationTimestamp) {
    throw new ElementError({ code: 1000, message: `Expiration timestamp must be a whole number of seconds` })
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

export async function _makeBuyOrder({
  networkName,
  exchangeAddr,
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
  networkName: Network
  exchangeAddr: string
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
  let { schema, elementAsset, quantityBN } = getSchemaAndAsset(networkName, asset, quantity)
  // const schema = getSchema(networkName, asset.schemaName)
  // const quantityBN = makeBigNumber(quantity) // WyvernProtocol.toBaseUnitAmount(makeBigNumber(quantity), asset.decimals || 0)
  // const wyAsset = getElementAsset(schema, asset, quantityBN)

  const taker = sellOrder ? sellOrder.maker : NULL_ADDRESS

  // OrderSide.Buy
  const feeRecipient = NULL_ADDRESS
  const feeMethod = FeeMethod.SplitFee

  // console.log(wyAsset)

  const { target, dataToCall, replacementPattern } = encodeBuy(schema, elementAsset, accountAddress)

  const { basePrice, extra, paymentToken } = getPriceParameters(
    networkName,
    OrderSide.Buy,
    paymentTokenAddress,
    expirationTime,
    startAmount
  )
  const times = getTimeParameters(expirationTime)

  return {
    exchange: exchangeAddr,
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
      asset: elementAsset,
      schema: schema.name as ElementSchemaName,
      referrerAddress
    }
  }
}

export async function _makeSellOrder({
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
  englishAuctionReservePrice = 0,
  paymentTokenAddress,
  extraBountyBasisPoints,
  buyerAddress
}: {
  networkName: Network
  exchangeAddr: string
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
  let { schema, elementAsset, quantityBN } = getSchemaAndAsset(networkName, asset, quantity)

  const { target, dataToCall, replacementPattern } = encodeSell(schema, elementAsset, accountAddress)

  const orderSaleKind =
    endAmount !== undefined && endAmount !== startAmount ? SaleKind.DutchAuction : SaleKind.FixedPrice

  const { basePrice, extra, paymentToken, reservePrice } = getPriceParameters(
    networkName,
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
    exchange: exchangeAddr,
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
      asset: elementAsset,
      schema: schema.name as ElementSchemaName
    }
  }
}

export function getTokenList(network: Network, symbol?: string): Array<any> {
  const payTokens = tokens[network]
  if (symbol) {
    return [payTokens.canonicalWrappedEther, ...payTokens.otherTokens].filter((x: any) => x.symbol === symbol)
  } else {
    return [payTokens.canonicalWrappedEther, ...payTokens.otherTokens]
  }
}

export function getSchemaList(network: Network, schemaName?: string): Array<Schema<any>> {
  // @ts-ignore
  let schemaList = schemas[network]
  if (!schemaList) {
    throw new Error(
      `Trading for this Network (${network}) is not yet supported. Please contact us or check back later!`
    )
  }
  if (schemaName) {
    schemaList = schemaList.filter((val: Schema<any>) => val.name === schemaName)
  }
  return schemaList
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

export async function getOrderHash(web3: any, exchangeHelper: any, order: UnhashedOrder): Promise<string> {
  const orderParamValueArray = orderParamsEncode(order)
  return exchangeHelper.methods.hashOrder(orderParamValueArray).call()
}

export async function hashAndValidateOrder(web3: any, exchangeHelper: any, order: UnhashedOrder): Promise<any> {
  const orderHash = await getOrderHash(web3, exchangeHelper, order)
  // let orderHash = hashOrder(web3, order)
  const hashedOrder = {
    ...order,
    hash: orderHash
  }
  let signature: ECSignature
  if (web3.eth.defaultAccount.toLowerCase() == hashedOrder.maker.toLowerCase()) {
    signature = await signOrderHash(web3, hashedOrder)
  } else {
    throw new ElementError({ code: 1000, message: 'web3.eth.defaultAccount and maker not equal' })
  }

  let orderWithSignature = {
    ...hashedOrder,
    ...signature
  }
  await validateOrder(exchangeHelper, orderWithSignature)
  return orderToJSON(orderWithSignature)
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
    throw new ElementError({ code: 1000, message: 'You declined to authorize your auction' })
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

export function schemaEncodeSell(network: Network, schema: ElementSchemaName, owner: string, data: any) {
  let schemaDefine: any = getSchemaList(network, schema)
  // schemaDefine = schemaDefine[0]
  let assetFiled: any = {}
  let fields = schemaDefine.fields
  for (let field of fields) {
    let val = data[field.name]
    if (!val) {
      throw field.name + ' is require！'
    }

    if (field.type == 'address') {
      val = val.toLowerCase()
    }

    if (field.type == 'address') {
      val = val.toLowerCase()
    }

    assetFiled[field.name] = val
  }

  let asset = schemaDefine.assetFromFields(assetFiled)

  let abi = schemaDefine.functions.transfer(asset)
  let kind = abi.inputs.some((val: any) => val.kind == 'owner')
  if (kind) {
    if (!owner) {
      throw 'must have owner field!'
    }
  }

  let { target, dataToCall, replacementPattern } = encodeSell(schemaDefine, asset, owner) //target,

  return { target, dataToCall, replacementPattern }
}

export function hashOrder(web3: any, order: UnhashedOrder): string {
  return web3.utils
    .soliditySha3(
      { type: 'address', value: order.exchange },
      { type: 'address', value: order.maker },
      { type: 'address', value: order.taker },
      { type: 'uint', value: order.makerRelayerFee },
      { type: 'uint', value: order.takerRelayerFee },
      { type: 'uint', value: order.takerProtocolFee },
      { type: 'uint', value: order.takerProtocolFee },
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
      { type: 'uint', value: order.basePrice },
      { type: 'uint', value: order.extra },
      { type: 'uint', value: order.listingTime },
      { type: 'uint', value: order.expirationTime },
      { type: 'uint', value: order.salt }
    )
    .toString('hex')
}
