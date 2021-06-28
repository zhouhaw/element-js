import { BigNumber, NULL_ADDRESS, INVERSE_BASIS_POINT } from './constants'

import { Order, OrderSide, SaleKind } from '../types'

import { toBaseUnitAmount, makeBigNumber } from './helper'
import { CallBack, ElementError, OrderCheckStatus } from '../index'

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

function transferFailure(error: any) {
  const error_ =
    error.code === '4001'
      ? new ElementError(error)
      : new ElementError({ code: '1000', message: 'Transfer Asset failure' })
  throw error_
}

export async function transferFromERC1155(
  {
    erc1155Contract,
    from,
    to,
    tokenId,
    amount
  }: {
    erc1155Contract: any
    from: string
    to: string
    tokenId: any
    amount: number
  },
  callBack?: CallBack
): Promise<any> {
  return erc1155Contract.methods
    .safeTransferFrom(from, to, tokenId, amount, '0x')
    .send({ from: from })
    .on('transactionHash', (txHash: string) => {
      // console.log('Send success tx hash：', txHash)
      callBack?.next(OrderCheckStatus.OrderMatchTxHash, { txHash })
    })
    .catch((error: any) => {
      transferFailure(error)
    })
}

export async function transferFromERC721(
  {
    erc721Contract,
    from,
    to,
    tokenId,
    amount
  }: {
    erc721Contract: any
    from: string
    to: string
    tokenId: any
    amount: number
  },
  callBack?: CallBack
): Promise<any> {
  return erc721Contract.methods
    .safeTransferFrom(from, to, tokenId, amount, '0x')
    .send({ from: from })
    .on('transactionHash', (txHash: string) => {
      callBack?.next(OrderCheckStatus.OrderMatchTxHash, { txHash })
      console.log('Send success tx hash：', txHash)
    })
}

export async function transferFromERC20(
  {
    erc20Contract,
    from,
    to,
    tokenId,
    amount
  }: {
    erc20Contract: any
    from: string
    to: string
    tokenId: any
    amount: number
  },
  callBack?: CallBack
): Promise<any> {
  return erc20Contract.methods.safeTransferFrom(from, to, tokenId, amount, '0x').send({ from: from })
}

export async function transferFromWETH(
  {
    WETHContract,
    from,
    to,
    tokenId,
    amount
  }: {
    WETHContract: any
    from: string
    to: string
    tokenId: any
    amount: number
  },
  callBack?: CallBack
) {
  let sellBal = await WETHContract.methods.balanceOf(from).call()
  if (Number(sellBal) < 1e18) {
    await WETHContract.methods.deposit().send({
      from: from,
      value: toBaseUnitAmount(makeBigNumber(amount), 18)
    })
    sellBal = await WETHContract.methods.balanceOf(from).call()
  }
  return sellBal
}

/**
 * Validates that an address exists, isn't null, and is properly
 * formatted for Wyvern and OpenSea
 * @param address input address
 */
export function validateAndFormatWalletAddress(web3: any, address: string): string {
  if (!address) {
    throw new Error('No wallet address found')
  }
  if (!web3.utils.isAddress(address)) {
    throw new Error('Invalid wallet address')
  }
  if (address == NULL_ADDRESS) {
    throw new Error('Wallet cannot be the null address')
  }
  return address.toLowerCase()
}
