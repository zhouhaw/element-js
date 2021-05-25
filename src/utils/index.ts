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

/**
 * @desc 链上返回大数处理，并小数点默认保留5位小数
 * @Params (bigNumberValue大数, decimalPow位, decimalDigits保留几个小数点)
 * @method chainValueConvert(bigNumberValue, decimalPow, decimalDigits)
 */
export function chainValueConvert(bigNumberValue: BigNumber.Value, decimalPow: number, decimalDigits?: number): string
export function chainValueConvert(bigNumberValue: () => BigNumber.Value, decimalPow: number, decimalDigits?: number): string
export function chainValueConvert(
    bigNumberValue: BigNumber.Value | (() => BigNumber.Value),
    decimalPow: number,
    decimalDigits = 5
): string {
  BigNumber.config({ DECIMAL_PLACES: decimalDigits, ROUNDING_MODE: BigNumber.ROUND_DOWN, EXPONENTIAL_AT: 1e9 })

  const val = typeof bigNumberValue === 'function' ? bigNumberValue() : bigNumberValue

  const decimalBase = new BigNumber(10)
  const decimal = decimalBase.pow(decimalPow)
  const valueReturn = new BigNumber(val)
  return valueReturn.div(decimal).toString(10)
}

/**
 * @desc 返回真实链上所需要的数值
 * @Params (decimalDigitsValue大数, decimalPow位)
 * @method chainValueRestore(decimalDigitsValue, decimalPow)
 */
export function chainValueRestore(decimalDigitsValue: BigNumber.Value, decimalPow: number): string
export function chainValueRestore(decimalDigitsValue: () => BigNumber.Value, decimalPow: number): string
export function chainValueRestore(decimalDigitsValue: BigNumber.Value | (() => BigNumber.Value), decimalPow: number): string {
  BigNumber.config({ DECIMAL_PLACES: 0, EXPONENTIAL_AT: 1e9 })

  const val = typeof decimalDigitsValue === 'function' ? decimalDigitsValue() : decimalDigitsValue

  const decimalBase = new BigNumber(10)
  const decimal = decimalBase.pow(decimalPow)
  const valueReturn = new BigNumber(val)
  return valueReturn.times(decimal).dp(0).toString()
}
