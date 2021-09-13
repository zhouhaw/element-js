// 一口价购买
import {
  web3Sign,
  Asset,
  ElementError,
  ElementSchemaName,
  Network,
  Orders,
  Token,
  OrderJSON,
  OrderSide,
  CallBack,
  Order,
  orderFromJSON,
  elementSignInSign,
  UnsignedOrder,
  computeOrderCallData,
  makeBigNumber
} from '../../index'
import { OrderVersionData, OrderVersionParams, OrdersAPI, OrderCancelParams } from './restful/ordersApi'
import { Account } from '../account'
import { UsersApi, GqlApi, AssetsApi } from './graphql'

import Web3 from 'web3'
import { BuyOrderParams, SellOrderParams, EnglishAuctionOrderParams, BiddingOrderParams } from './types'
import { ElementAPIConfig } from '../types'

export type { BuyOrderParams, SellOrderParams, EnglishAuctionOrderParams, BiddingOrderParams }

const checkOrderHash = (order: any): Order => {
  const hashOrder =
    !order?.hash && order?.orderHash
      ? {
          ...order,
          hash: order?.orderHash
        }
      : order
  const signedOrder: Order = orderFromJSON(hashOrder)

  return signedOrder
}

export class ElementOrders extends OrdersAPI {
  public orders: Orders
  public account: Account
  public gqlApi: {
    usersApi: UsersApi
    assetsApi: AssetsApi
  }
  public walletProvider: Web3
  public accountAddress = ''

  // 初始化SDK
  constructor(
    walletProvider: Web3,
    apiConfig: ElementAPIConfig,
    walletAccount?: {
      address?: string
      privateKey?: string
    }
  ) {
    super(apiConfig)
    const networkName = apiConfig.networkName
    const apiUrl = apiConfig.apiBaseUrl
    if (walletAccount?.privateKey) {
      const account = walletProvider.eth.accounts.wallet.add(walletAccount?.privateKey)
      walletProvider.eth.defaultAccount = account.address
    }
    this.accountAddress = walletAccount?.address || walletProvider.eth.defaultAccount?.toLowerCase() || ''
    this.orders = new Orders(walletProvider, apiConfig)
    this.account = new Account(walletProvider, apiConfig)

    this.gqlApi = {
      usersApi: new GqlApi.usersApi({ networkName, account: this.accountAddress, apiBaseUrl: apiUrl }),
      assetsApi: new GqlApi.assetsApi({ networkName, account: this.accountAddress, apiBaseUrl: apiUrl })
    }
    this.walletProvider = walletProvider
  }

  // 接口登录Token
  public async getLoginAuthToken(): Promise<string> {
    const accountAddress = this.accountAddress
    const nonce = await this.gqlApi.usersApi.getNewNonce()
    const { message, signature } = await elementSignInSign(this.walletProvider, nonce, accountAddress)
    this.authToken = await this.gqlApi.usersApi.getSignInToken({ message, signature })
    return this.authToken
  }

  public async login(): Promise<void> {
    const accountAddress = this.accountAddress
    const nonce = await this.gqlApi.usersApi.getNewNonce()
    const { message, signature } = await elementSignInSign(this.walletProvider, nonce, accountAddress)
    this.authToken = await this.gqlApi.usersApi.getSignInToken({ message, signature })
  }

  // 取消订单签名
  public async ordersCancelSign(hash: string): Promise<OrderCancelParams> {
    const signature = await web3Sign(this.account.web3, hash, this.accountAddress)
    return { hash, signature }
  }

  // 请求提交order的版本信息和uri
  public async getAssetOrderVersion(assetData: Asset): Promise<{ orderVersion: OrderVersionData; newAsset: Asset }> {
    const orderAsset: OrderVersionParams = {
      contractAddress: assetData.tokenAddress,
      tokenId: assetData.tokenId,
      chain: this.chain,
      chainId: this.walletChainId
    }

    const orderVersion = await this.ordersVersion(orderAsset)
    // console.log(orderAsset, orderVersion)
    if (!orderVersion.isTradable) {
      throw new ElementError({ code: '1212' })
    }
    let newAsset = { ...assetData }
    const sharedAsset = this.orders.elementSharedAssetAddr.toLowerCase()
    // console.log('getAssetOrderVersion', this.walletChainId, orderVersion)
    if (
      orderVersion.orderVersion === 1 &&
      orderAsset.contractAddress === sharedAsset &&
      orderVersion.uri &&
      !assetData.data
    ) {
      newAsset = { ...assetData, data: orderVersion.uri }
    } else {
      if (assetData.schemaName === ElementSchemaName.ERC1155 && orderVersion.orderVersion === 0) {
        newAsset = { ...assetData, data: '' }
      }
    }
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
    // const paymentTokenObj: Token = paymentToken
    const { orderVersion, newAsset } = await this.getAssetOrderVersion(asset)
    const sellParams = {
      asset: newAsset,
      quantity,
      paymentTokenObj: paymentToken,
      accountAddress: this.accountAddress,
      startAmount,
      endAmount,
      listingTime,
      expirationTime,
      buyerAddress
    }
    const sellData = await this.orders.createSellOrder(sellParams)
    // const isCheckOrder = await checkOrder(this.orders, sellData)
    // console.log('isCheckOrder', isCheckOrder, sellData)
    if (!sellData) return
    const order = { ...sellData, version: orderVersion.orderVersion } as OrderJSON

    return this.ordersPost({ order })
  }
  // 创建英拍 卖单
  public async createAuctionOrder({
    asset,
    quantity,
    paymentToken,
    expirationTime,
    startAmount,
    englishAuctionReservePrice
  }: EnglishAuctionOrderParams): Promise<any> {
    const { orderVersion, newAsset } = await this.getAssetOrderVersion(asset)
    const sellParams = {
      asset: newAsset,
      quantity,
      paymentTokenObj: paymentToken,
      accountAddress: this.accountAddress,
      startAmount,
      englishAuctionReservePrice,
      expirationTime,
      waitForHighestBid: true
    }
    const sellData = await this.orders.createSellOrder(sellParams)
    if (!sellData) return
    const order = { ...sellData, version: orderVersion.orderVersion } as OrderJSON
    return this.ordersPost({ order })
  }
  //------------------ 买单---------------

  // 创建竞价 买单
  public async createBiddingOrder({
    asset,
    quantity,
    paymentToken,
    startAmount,
    bestAsk
  }: BiddingOrderParams): Promise<any> {
    if (bestAsk?.bestAskOrderType === 0) return

    const askOrder: any = bestAsk ? JSON.parse(bestAsk?.bestAskOrderString) : false

    const sellOrder: Order = orderFromJSON(askOrder)

    const paymentTokenObj: Token = { ...paymentToken, decimals: paymentToken?.decimals } as Token

    const { orderVersion, newAsset } = await this.getAssetOrderVersion(asset)

    const biddingParams = {
      asset: newAsset,
      accountAddress: this.accountAddress,
      startAmount, // 订单总价
      paymentTokenObj,
      expirationTime: sellOrder?.expirationTime.toNumber(),
      quantity: sellOrder?.quantity.toNumber(),
      sellOrder
    }
    const buyData = await this.orders.createBuyOrder(biddingParams)
    if (!buyData) return
    const order = { ...buyData, version: orderVersion.orderVersion } as OrderJSON
    return this.ordersPost({ order })
  }

  // 创建报价订单
  public async createBuyOrder({
    asset,
    quantity,
    paymentToken,
    expirationTime,
    startAmount
  }: BuyOrderParams): Promise<any> {
    const { orderVersion, newAsset } = await this.getAssetOrderVersion(asset)
    paymentToken = paymentToken || this.orders.WETHToekn
    const buyParams = {
      asset: newAsset,
      accountAddress: this.accountAddress,
      startAmount, // 订单总价
      paymentTokenObj: paymentToken,
      expirationTime,
      quantity
    }
    const buyData = await this.orders.createBuyOrder(buyParams)
    if (!buyData) return
    const order = { ...buyData, version: orderVersion.orderVersion } as OrderJSON
    return this.ordersPost({ order })
  }

  //
  // // 创建降价单
  public async createLowerPriceOrder({
    oldOrder,
    parameter,
    asset
  }: {
    oldOrder: Order
    parameter: any
    asset?: any
  }): Promise<any> {
    // const { accountAddress, orderData, networkName, chainName, walletChainId } = await newOrder()
    const metadataAsset = oldOrder.metadata.asset
    const assetData = {
      tokenAddress: metadataAsset.address,
      tokenId: metadataAsset.id,
      schemaName: oldOrder.metadata.schema
    } as Asset
    const { orderVersion, newAsset } = await this.getAssetOrderVersion(assetData)
    const sharedAsset = this.orders.elementSharedAssetAddr.toLowerCase()

    if (metadataAsset.address === sharedAsset && orderVersion.uri && orderVersion.orderVersion === 1) {
      metadataAsset.data = newAsset.data
    }
    const unsignedOrder: UnsignedOrder = { ...oldOrder, ...parameter } as UnsignedOrder

    const { dataToCall, replacementPattern } = computeOrderCallData(
      unsignedOrder,
      this.orders.networkName,
      this.accountAddress
    )

    const unHashOrder = { ...unsignedOrder, dataToCall, replacementPattern, makerReferrerFee: makeBigNumber(0) }

    const signOrder = await this.orders.creatSignedOrder({ unHashOrder })
    if (!signOrder) return

    const order = { ...signOrder, version: orderVersion.orderVersion } as OrderJSON

    return this.ordersPost({ order })
  }

  //撮合 接受买单/购买-----------------order match
  public async acceptOrder(bestOrder: OrderJSON) {
    const accountAddress = this.accountAddress
    const signedOrder = checkOrderHash(bestOrder)
    let recipientAddress = ''
    if (bestOrder.side === OrderSide.Sell) {
      recipientAddress = accountAddress
    }
    if (bestOrder.side === OrderSide.Buy) {
      recipientAddress = bestOrder.maker
    }
    const { buy, sell } = this.orders.makeMatchingOrder({ signedOrder, accountAddress, recipientAddress })

    const res = await this.account.orderMatch({
      buy,
      sell
    })
    return res
  }
}

// -------------------------------- 创建订单--检查-签名 -------------------------------------

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
