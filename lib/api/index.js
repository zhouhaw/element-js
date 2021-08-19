"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElementOrders = exports.MakeOrderType = void 0;
// 一口价购买
var index_1 = require("../index");
// import { ordersVersion, postOrder } from './index'
var orderApi_1 = require("./orderApi");
var MakeOrderType;
(function (MakeOrderType) {
    MakeOrderType["FixPriceOrder"] = "FixPriceOrder";
    MakeOrderType["DutchAuctionOrder"] = "DutchAuctionOrder";
    MakeOrderType["EnglishAuctionOrder"] = "EnglishAuctionOrder";
    MakeOrderType["LowerPriceOrder"] = "LowerPriceOrder";
    MakeOrderType["MakeOfferOrder"] = "MakeOfferOrder";
    MakeOrderType["EnglishAuctionBiddingOrder"] = "EnglishAuctionBiddingOrder";
})(MakeOrderType = exports.MakeOrderType || (exports.MakeOrderType = {}));
var ElementOrders = /** @class */ (function (_super) {
    __extends(ElementOrders, _super);
    // 初始化SDK
    function ElementOrders(_a) {
        var walletProvider = _a.walletProvider, networkName = _a.networkName, privateKey = _a.privateKey;
        var _this = _super.call(this, { networkName: networkName }) || this;
        _this.accountAddress = '';
        _this.walletChainId = '0x1';
        _this.networkName = index_1.Network.Private;
        _this.chainName = 'eth';
        _this.chainId = 1;
        if (privateKey) {
            var account = walletProvider.eth.accounts.wallet.add(privateKey);
            walletProvider.eth.defaultAccount = account.address;
        }
        _this.accountAddress = walletProvider.eth.defaultAccount.toLowerCase();
        if (networkName === index_1.Network.Main) {
            _this.chainId = 1;
        }
        if (networkName === index_1.Network.Rinkeby) {
            _this.chainId = 4;
        }
        _this.orders = new index_1.Orders(walletProvider, { networkName: networkName });
        _this.walletChainId = "0x" + _this.chainId.toString(16);
        return _this;
    }
    // 取消订单签名
    ElementOrders.prototype.ordersCancelSign = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            var signature;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, index_1.web3Sign(this.orders.web3, hash, this.accountAddress)];
                    case 1:
                        signature = _a.sent();
                        return [2 /*return*/, { hash: hash, signature: signature }];
                }
            });
        });
    };
    // 请求提交order的版本信息和uri
    ElementOrders.prototype.getAssetOrderVersion = function (assetData) {
        return __awaiter(this, void 0, void 0, function () {
            var orderAsset, orderVersion, newAsset;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        orderAsset = {
                            contractAddress: assetData.tokenAddress,
                            tokenId: assetData.tokenId,
                            chain: this.chainName,
                            chainId: this.walletChainId
                        };
                        console.log('getAssetOrderVersion', orderAsset);
                        return [4 /*yield*/, this.ordersVersion(orderAsset)];
                    case 1:
                        orderVersion = _a.sent();
                        console.log(orderVersion);
                        if (!orderVersion.isTradable) {
                            throw new index_1.ElementError({ code: '1212' });
                        }
                        newAsset = __assign({}, assetData);
                        console.log(newAsset);
                        return [2 /*return*/, { orderVersion: orderVersion, newAsset: newAsset }];
                }
            });
        });
    };
    // 创建卖单 一口价，荷兰拍
    ElementOrders.prototype.createSellOrder = function (_a) {
        var asset = _a.asset, _b = _a.quantity, quantity = _b === void 0 ? 1 : _b, _c = _a.paymentToken, paymentToken = _c === void 0 ? this.orders.ETH : _c, _d = _a.listingTime, listingTime = _d === void 0 ? 0 : _d, _e = _a.expirationTime, expirationTime = _e === void 0 ? 0 : _e, startAmount = _a.startAmount, endAmount = _a.endAmount, buyerAddress = _a.buyerAddress;
        return __awaiter(this, void 0, void 0, function () {
            var paymentTokenObj, _f, orderVersion, newAsset, sellParams, sellData, order;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        paymentTokenObj = paymentToken;
                        return [4 /*yield*/, this.getAssetOrderVersion(asset)];
                    case 1:
                        _f = _g.sent(), orderVersion = _f.orderVersion, newAsset = _f.newAsset;
                        sellParams = {
                            asset: newAsset,
                            quantity: quantity,
                            paymentTokenObj: paymentTokenObj,
                            accountAddress: this.accountAddress,
                            startAmount: startAmount,
                            endAmount: endAmount,
                            listingTime: listingTime,
                            expirationTime: expirationTime,
                            buyerAddress: buyerAddress
                        };
                        return [4 /*yield*/, this.orders.createSellOrder(sellParams)];
                    case 2:
                        sellData = _g.sent();
                        if (!sellData)
                            return [2 /*return*/];
                        order = __assign(__assign({}, sellData), { version: orderVersion.orderVersion });
                        console.log(order);
                        return [2 /*return*/, this.ordersPost({ order: order })];
                }
            });
        });
    };
    return ElementOrders;
}(orderApi_1.OrdersAPI));
exports.ElementOrders = ElementOrders;
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
