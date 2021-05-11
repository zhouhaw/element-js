import {
  Asset,
  ElementAsset,
  ElementSchemaName,
  FeeMethod,
  HowToCall,
  Network,
  Order,
  OrderSide,
  SaleKind,
  UnhashedOrder
} from '../types'
import { encodeBuy, encodeSell, MAX_DIGITS_IN_UNSIGNED_256_INT, NULL_ADDRESS } from './index'
import { Schema } from '../schema/types'
import { schemas } from '../schema/schemas'
import BigNumber from 'bignumber.js'
import { tokens } from '../schema/tokens'
BigNumber.config({ EXPONENTIAL_AT: 1e9 })

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
  // @ts-ignore
  const scahmaList = schemas[network]
  if (!scahmaList) {
    throw new Error(
      `Trading for this Network (${network}) is not yet supported. Please contact us or check back later!`
    )
  }

  const schemaInfo = scahmaList.find((val: Schema<any>) => val.name === schemaName_)

  if (!schemaInfo) {
    throw new Error(
      `Trading for this asset (${schemaName_}) is not yet supported. Please contact us or check back later!`
    )
  }
  return schemaInfo
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

export function generatePseudoRandomSalt() {
  // BigNumber.random returns a pseudo-random number between 0 & 1 with a passed in number of decimal places.
  // Source: https://mikemcl.github.io/bignumber.js/#random
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
    throw new Error(`English auctions must use wrapped ETH or an ERC-20 token.`)
  }
  // if (isEther && orderSide === OrderSide.Buy) {
  //   throw new Error(`Offers must use wrapped ETH or an ERC-20 token.`)
  // }
  if (priceDiff < 0) {
    throw new Error('End price must be less than or equal to the start price.')
  }
  if (priceDiff > 0 && expirationTime == 0) {
    throw new Error('Expiration time must be set if order will change in price.')
  }
  if (englishAuctionReservePrice && !waitingForBestCounterOrder) {
    throw new Error('Reserve prices may only be set on English auctions.')
  }
  if (englishAuctionReservePrice && englishAuctionReservePrice < startAmount) {
    throw new Error('Reserve price must be greater than or equal to the start amount.')
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

const MIN_EXPIRATION_SECONDS = 10
const ORDER_MATCHING_LATENCY_SECONDS = 60 * 60 * 24 * 7

export function getTimeParameters(
  expirationTimestamp: number,
  listingTimestamp?: number,
  waitingForBestCounterOrder = false
) {
  // Validation
  const minExpirationTimestamp = Math.round(Date.now() / 1000 + MIN_EXPIRATION_SECONDS)
  const minListingTimestamp = Math.round(Date.now() / 1000)
  if (expirationTimestamp != 0 && expirationTimestamp < minExpirationTimestamp) {
    throw new Error(
      `Expiration time must be at least ${MIN_EXPIRATION_SECONDS} seconds from now, or zero (non-expiring).`
    )
  }
  if (listingTimestamp && listingTimestamp < minListingTimestamp) {
    throw new Error('Listing time cannot be in the past.')
  }
  if (listingTimestamp && expirationTimestamp !== 0 && listingTimestamp >= expirationTimestamp) {
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
  const schema = getSchema(networkName, asset.schemaName)
  const quantityBN = makeBigNumber(quantity) // WyvernProtocol.toBaseUnitAmount(makeBigNumber(quantity), asset.decimals || 0)

  const wyAsset = getElementAsset(schema, asset, quantityBN)

  const taker = sellOrder ? sellOrder.maker : NULL_ADDRESS

  // OrderSide.Buy
  const feeRecipient = NULL_ADDRESS
  const feeMethod = FeeMethod.SplitFee

  // console.log(wyAsset)

  const { target, dataToCall, replacementPattern } = encodeBuy(schema, wyAsset, accountAddress)

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
      asset: wyAsset,
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
  const schema = getSchema(networkName, asset.schemaName)

  const quantityBN = makeBigNumber(quantity)
  const wyAsset = getElementAsset(schema, asset, quantityBN)

  const { target, dataToCall, replacementPattern } = encodeSell(schema, wyAsset, accountAddress)

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
      asset: wyAsset,
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

export function getSchemaList(network: Network, schemaName?: string): Array<any> {
  // @ts-ignore
  let schemaList = schemas[network]
  if (schemaName) {
    schemaList = schemaList.filter((x: any) => x.name === schemaName)
  }
  return schemaList
}
