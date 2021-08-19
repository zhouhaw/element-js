// 一口价购买
import {
  web3Sign,
  Asset,
  CallBack,
  computeOrderCallData,
  CONTRACTS_ADDRESSES,
  ElementError,
  ElementSchemaName,
  getAccountBalance,
  getCurrentPrice,
  makeBigNumber,
  Network,
  NULL_ADDRESS,
  Order,
  OrderCheckStatus,
  orderFromJSON,
  Orders,
  OrderSide,
  Sleep,
  Token,
  transferFromERC1155,
  transferFromERC20,
  transferFromERC721,
  getOrderCancelledOrFinalized,
  getSchemaList
} from '../index'
// import { ordersVersion, postOrder } from './index'
import { OrderVersionData, OrderVersionParams, OrdersAPI, OrderCancelParams } from './orderApi'
// import { AssetsDetailPrice, AssetType, PaymentTokenType, TradeBestAskType } from '@graphql/types/assets'
import { OrderJSON, UnsignedOrder } from '../types'
// import { MakeOrderType, postAssetLogs, postOrderLogs, postOrderMatchLogs } from '@public/helper/orderLogs'
// import { getSigneInToken, walletConnectInfo, WalletEventType } from '@public/helper/wallet'
// import { chainValueConvert } from '@public/helper/index'
import { transferFromSchema } from '../utils/transfer'

export enum MakeOrderType {
  FixPriceOrder = 'FixPriceOrder',
  DutchAuctionOrder = 'DutchAuctionOrder',
  EnglishAuctionOrder = 'EnglishAuctionOrder',
  LowerPriceOrder = 'LowerPriceOrder',
  MakeOfferOrder = 'MakeOfferOrder',
  EnglishAuctionBiddingOrder = 'EnglishAuctionBiddingOrder'
}

export interface TradeBestAskType {
  bestAskSaleKind: number
  bestAskPrice: number
  bestAskToken: string
  bestAskPriceBase: number
  bestAskPriceUSD: number
  bestAskListingDate: string
  bestAskExpirationDate: string
  bestAskPriceCNY: number
  bestAskCreatedDate: string
  bestAskOrderString: string
  bestAskOrderType: number
  bestAskOrderQuantity: number
  bestAskTokenContract: Token
}

export interface CreateOrderParams {
  asset: Asset
  quantity?: number
  paymentToken?: Token
}

export interface SellOrderParams extends CreateOrderParams {
  listingTime?: number
  expirationTime?: number
  startAmount: number
  endAmount?: number
  buyerAddress?: string
}

export class ElementOrders extends OrdersAPI {
  public orders: any
  public accountAddress: string = ''
  public walletChainId: string = '0x1'
  public networkName = Network.Private
  public chainName: string = 'eth'
  public chainId = 1

  // 初始化SDK
  constructor({
    walletProvider,
    networkName,
    privateKey
  }: {
    walletProvider: any
    networkName: Network
    privateKey?: string
  }) {
    super({ networkName })
    if (privateKey) {
      const account = walletProvider.eth.accounts.wallet.add(privateKey)
      walletProvider.eth.defaultAccount = account.address
    }
    this.accountAddress = walletProvider.eth.defaultAccount.toLowerCase()
    if (networkName === Network.Main) {
      this.chainId = 1
    }

    if (networkName === Network.Rinkeby) {
      this.chainId = 4
    }
    this.orders = new Orders(walletProvider, { networkName })
    this.walletChainId = `0x${this.chainId.toString(16)}`
  }

  // 取消订单签名
  public async ordersCancelSign(hash: string): Promise<OrderCancelParams> {
    const signature = await web3Sign(this.orders.web3, hash, this.accountAddress)
    return { hash, signature }
  }

  // 请求提交order的版本信息和uri
  public async getAssetOrderVersion(assetData: Asset): Promise<{ orderVersion: OrderVersionData; newAsset: Asset }> {
    const orderAsset: OrderVersionParams = {
      contractAddress: assetData.tokenAddress,
      tokenId: assetData.tokenId,
      chain: this.chainName,
      chainId: this.walletChainId
    }

    console.log('getAssetOrderVersion', orderAsset)

    const orderVersion = await this.ordersVersion(orderAsset)
    console.log(orderVersion)
    if (!orderVersion.isTradable) {
      throw new ElementError({ code: '1212' })
    }
    let newAsset = { ...assetData }
    console.log(newAsset)
    return { orderVersion, newAsset }
  }

  // 创建卖单 一口价，荷兰拍
  public async createSellOrder({
    asset,
    quantity = 1,
    paymentToken = this.orders.ETH,
    listingTime = 0,
    expirationTime = 0,
    startAmount,
    endAmount,
    buyerAddress
  }: SellOrderParams): Promise<any> {
    const paymentTokenObj: Token = paymentToken
    const { orderVersion, newAsset } = await this.getAssetOrderVersion(asset)
    const sellParams = {
      asset: newAsset,
      quantity,
      paymentTokenObj,
      accountAddress: this.accountAddress,
      startAmount,
      endAmount,
      listingTime,
      expirationTime,
      buyerAddress
    }
    const sellData = await this.orders.createSellOrder(sellParams)
    if (!sellData) return
    const order = { ...sellData, version: orderVersion.orderVersion } as OrderJSON
    console.log(order)
    return this.ordersPost({ order })
  }
}

// -------------------------------- 创建订单--检查-签名 -------------------------------------

// export interface EnglishAuctionOrderParams extends CreateOrderParams {
//   expirationTime: number
//   startAmount: number
//   englishAuctionReservePrice?: number
// }
//
// export interface BiddingOrderParams extends CreateOrderParams {
//   startAmount: number
//   bestAsk: TradeBestAskType
// }
//

//
// export interface BuyOrderParams extends CreateOrderParams {
//   expirationTime: number
//   startAmount: number
// }

// // 创建英拍 卖单
// const createAuctionOrder = async (
//   { asset, quantity, paymentToken, expirationTime, startAmount, englishAuctionReservePrice }: EnglishAuctionOrderParams,
//   callBack?: CallBack
// ): Promise<any> => {
//   const { accountAddress, orderData, walletChainId, chainName } = await newOrder()
//
//   const paymentTokenObj: Token = { ...paymentToken, decimals: paymentToken?.decimals } as Token
//   const { orderVersion, newAsset } = await getAssetOrderVersion({
//     assetData: asset,
//     chain: chainName,
//     chainId: walletChainId
//   })
//
//   const sellParams = {
//     asset: newAsset,
//     quantity,
//     paymentTokenObj,
//     accountAddress,
//     startAmount,
//     englishAuctionReservePrice,
//     expirationTime,
//     waitForHighestBid: true
//   }
//   callBack?.next(OrderCheckStatus.StartOrderHashSign)
//
//   const sellData = await orderData.createSellOrder(sellParams)
//   if (!sellData) return
//   callBack?.next(OrderCheckStatus.EndOrderHashSign)
//
//   const order = { ...sellData, version: orderVersion.orderVersion } as OrderJSON
//   return postOrder(order)
// }
//
// // 创建竞价 买单
// const createBiddingOrder = async (
//   { asset, quantity, paymentToken, startAmount, bestAsk }: BiddingOrderParams,
//   callBack?: CallBack
// ): Promise<any> => {
//   const { accountAddress, orderData, walletChainId, chainName } = await newOrder()
//   if (bestAsk?.bestAskOrderType === 0) return
//
//   const askOrder: any = bestAsk ? JSON.parse(bestAsk?.bestAskOrderString) : false
//
//   const sellOrder: Order = orderFromJSON(askOrder)
//
//   const paymentTokenObj: Token = { ...paymentToken, decimals: paymentToken?.decimals } as Token
//
//   const { orderVersion, newAsset } = await getAssetOrderVersion({
//     assetData: asset,
//     chain: chainName,
//     chainId: walletChainId
//   })
//
//   const biddingParams = {
//     asset: newAsset,
//     accountAddress,
//     startAmount, // 订单总价
//     paymentTokenObj,
//     expirationTime: sellOrder?.expirationTime.toNumber(),
//     quantity: sellOrder?.quantity.toNumber(),
//     sellOrder
//   }
//   const buyData = await orderData.createBuyOrder(biddingParams)
//   if (!buyData) return
//   const order = { ...buyData, version: orderVersion.orderVersion } as OrderJSON
//   return postOrder(order)
// }
//
// // 创建卖单 一口价，荷兰拍
// const createSellOrder = async ({
//   asset,
//   quantity,
//   paymentToken,
//   listingTime,
//   expirationTime,
//   startAmount,
//   endAmount
// }: SellOrderParams): Promise<any> => {
//   const { accountAddress, orderData, walletChainId, chainName } = await newOrder()
//   const paymentTokenObj: Token = { ...paymentToken, decimals: paymentToken?.decimals } as Token
//
//   const { orderVersion, newAsset } = await getAssetOrderVersion({
//     assetData: asset,
//     chain: chainName,
//     chainId: walletChainId
//   })
//   const sellParams = {
//     asset: newAsset,
//     quantity,
//     paymentTokenObj,
//     accountAddress,
//     startAmount,
//     endAmount,
//     listingTime,
//     expirationTime
//   }
//
//   const sellData = await orderData.createSellOrder(sellParams)
//
//   if (!sellData) return
//   const order = { ...sellData, version: orderVersion.orderVersion } as OrderJSON
//   return postOrder(order)
// }
//
// // 创建报价订单
// const createBuyOrder = async ({
//   asset,
//   quantity,
//   paymentToken,
//   expirationTime,
//   startAmount
// }: BuyOrderParams): Promise<any> => {
//   const { accountAddress, orderData, walletChainId, chainName } = await newOrder()
//   const paymentTokenObj: Token = { ...paymentToken, decimals: paymentToken?.decimals } as Token
//   const { orderVersion, newAsset } = await getAssetOrderVersion({
//     assetData: asset,
//     chain: chainName,
//     chainId: walletChainId
//   })
//
//   const buyParams = {
//     asset: newAsset,
//     accountAddress,
//     startAmount, // 订单总价
//     paymentTokenObj,
//     expirationTime,
//     quantity
//   }
//
//   const buyData = await orderData.createBuyOrder(buyParams)
//
//   if (!buyData) return
//   const order = { ...buyData, version: orderVersion.orderVersion } as OrderJSON
//   return postOrder(order)
// }
//
// // 创建降价单
// const createLowerPriceOrder = async ({
//   oldOrder,
//   parameter,
//   asset
// }: {
//   oldOrder: Order
//   parameter: any
//   asset?: any
// }): Promise<any> => {
//   const { accountAddress, orderData, networkName, chainName, walletChainId } = await newOrder()
//   const unsignedOrder: UnsignedOrder = { ...oldOrder, ...parameter } as UnsignedOrder
//
//   const { dataToCall, replacementPattern } = computeOrderCallData(unsignedOrder, networkName, accountAddress)
//
//   const unHashOrder = { ...unsignedOrder, dataToCall, replacementPattern, makerReferrerFee: makeBigNumber(0) }
//
//   const signOrder = await orderData.creatSignedOrder({ unHashOrder })
//   if (!signOrder) return
//
//   const { orderVersion } = await getAssetOrderVersion({
//     assetData: {
//       tokenAddress: unsignedOrder.metadata.asset.address,
//       tokenId: unsignedOrder.metadata.asset.id
//     } as Asset,
//     chain: chainName,
//     chainId: walletChainId
//   })
//
//   const order = { ...signOrder, version: orderVersion.orderVersion } as OrderJSON
//   return postOrder(order)
// }
//
// export const createOrder = async ({
//   orderType,
//   orderParams,
//   callBack
// }: {
//   orderType: MakeOrderType
//   orderParams: any
//   callBack?: CallBack
// }): Promise<any> => {
//   const assetType = orderParams?.asset?.schemaName
//
//   const isSupport = Object.keys(ElementSchemaName).includes(assetType)
//   if (!isSupport) {
//     throw new ElementError({ code: '1206', context: { assetType } })
//   }
//   let result
//   try {
//     switch (orderType) {
//       case MakeOrderType.FixPriceOrder:
//         result = await createSellOrder(orderParams as SellOrderParams)
//         break
//       case MakeOrderType.DutchAuctionOrder:
//         result = await createSellOrder(orderParams as SellOrderParams)
//         break
//       case MakeOrderType.EnglishAuctionOrder:
//         result = await createAuctionOrder(orderParams as EnglishAuctionOrderParams)
//         break
//       case MakeOrderType.LowerPriceOrder:
//         result = await createLowerPriceOrder(orderParams)
//         break
//       case MakeOrderType.MakeOfferOrder:
//         result = await createBuyOrder(orderParams as BuyOrderParams)
//         break
//       case MakeOrderType.EnglishAuctionBiddingOrder:
//         result = await createBiddingOrder(orderParams as BiddingOrderParams)
//         break
//       default:
//         throw new ElementError({ code: '1000', message: 'Help Orders undefined function' })
//         break
//     }
//   } catch (error) {
//     throw error
//   }
//   return result
// }
//
// // -------------------------------- 合约操作 -------------------------------------
//
// const checkOrderHash = (order: any): Order => {
//   const hashOrder =
//     !order?.hash && order?.orderHash
//       ? {
//           ...order,
//           hash: order?.orderHash
//         }
//       : order
//   const signedOrder: Order = orderFromJSON(hashOrder)
//
//   return signedOrder
// }
//
// // 接受买单/购买-----------------order match
// export const acceptOrder = async (bestAskOrder: any, callBack?: CallBack) => {
//   const { accountAddress, orderData } = await newOrder()
//   const signedOrder = checkOrderHash(bestAskOrder)
//
//   let recipientAddress = ''
//   if (bestAskOrder.side === OrderSide.Sell) {
//     recipientAddress = accountAddress
//   }
//   if (bestAskOrder.side === OrderSide.Buy) {
//     recipientAddress = bestAskOrder.maker
//   }
//   const { buy, sell } = orderData.makeMatchingOrder({ signedOrder, accountAddress, recipientAddress })
//
//   const res = await orderData.orderMatch(
//     {
//       buy,
//       sell,
//       accountAddress
//     },
//     callBack
//   )
//   return res
// }
//
// // 是否能取消
// export const canCancelOrder = async (order: any): Promise<boolean> => {
//   const { orderData } = await newOrder()
//   return getOrderCancelledOrFinalized(orderData, checkOrderHash(order))
// }
//
// // 取消订单
// export const cancelOrder = async (order: any): Promise<void> => {
//   const { accountAddress, orderData } = await newOrder()
//   console.log('order.cancelOrder1')
//   await orderData.cancelOrder({ order: checkOrderHash(order), accountAddress })
//   console.log('order.cancelOrder2')
//   await Sleep(5000)
// }
//
// // 获取当前订单最佳  总价格
// export const getBestSellPrice = async (sellOrder: any): Promise<string> => {
//   const { orderData } = await newOrder()
//   return getCurrentPrice(orderData.exchangeHelper, sellOrder)
// }
//
// // 发送资产
// export const transferAsset = async (
//   { asset, to, amount = 1 }: { asset: Asset; to: string; amount: number },
//   callBack?: CallBack
// ): Promise<any> => {
//   const { accountAddress, orderData, chainName, networkName, walletChainId } = await newOrder()
//   const schemas = getSchemaList(networkName, asset?.schemaName)
//   if (schemas.length === 0) {
//     throw new ElementError({ code: '1206', context: { assetType: asset.schemaName } })
//   }
//   const from = accountAddress
//   const tokenId = asset.tokenId
//   const assetAddress = asset.tokenAddress
//   const assetData: Asset = {
//     tokenId: asset?.tokenId,
//     tokenAddress: asset?.tokenAddress || '',
//     schemaName: asset?.schemaName as ElementSchemaName
//   }
//   const { orderVersion } = await getAssetOrderVersion({
//     assetData,
//     chain: chainName,
//     chainId: walletChainId
//   })
//   if (!orderVersion.isTradable) {
//     throw new ElementError({ code: '1212' })
//   }
//   if (assetData.schemaName === ElementSchemaName.ERC20) {
//     const erc20Contract = orderData.erc20.clone()
//     erc20Contract.options.address = assetAddress
//     return transferFromERC20({ erc20Contract, from, to, tokenId, amount }, callBack)
//   }
//   if (assetData.schemaName === ElementSchemaName.ERC721) {
//     const erc721Contract = orderData.erc721.clone()
//     erc721Contract.options.address = assetAddress
//     return transferFromERC721({ erc721Contract, from, to, tokenId, amount }, callBack)
//   }
//   if (assetData.schemaName === ElementSchemaName.ERC1155) {
//     const erc1155Contract = orderData.erc1155.clone()
//     erc1155Contract.options.address = assetAddress
//     return transferFromERC1155({ erc1155Contract, from, to, tokenId, amount }, callBack)
//   }
//
//   if (assetData.schemaName === ElementSchemaName.CryptoKitties) {
//     return transferFromSchema({ contract: orderData, asset: assetData, from, to, amount }, callBack)
//   }
// }
