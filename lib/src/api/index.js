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
exports.ElementOrders = void 0;
// 一口价购买
var index_1 = require("../../index");
var ordersApi_1 = require("./restful/ordersApi");
var account_1 = require("../account");
var graphql_1 = require("./graphql");
var checkOrderHash = function (order) {
    var hashOrder = !(order === null || order === void 0 ? void 0 : order.hash) && (order === null || order === void 0 ? void 0 : order.orderHash)
        ? __assign(__assign({}, order), { hash: order === null || order === void 0 ? void 0 : order.orderHash }) : order;
    var signedOrder = index_1.orderFromJSON(hashOrder);
    return signedOrder;
};
var ElementOrders = /** @class */ (function (_super) {
    __extends(ElementOrders, _super);
    // 初始化SDK
    function ElementOrders(walletProvider, apiConfig, walletAccount) {
        var _a;
        var _this = _super.call(this, apiConfig) || this;
        _this.accountAddress = '';
        var networkName = apiConfig.networkName;
        var apiUrl = apiConfig.apiBaseUrl;
        if (walletAccount === null || walletAccount === void 0 ? void 0 : walletAccount.privateKey) {
            var account = walletProvider.eth.accounts.wallet.add(walletAccount === null || walletAccount === void 0 ? void 0 : walletAccount.privateKey);
            walletProvider.eth.defaultAccount = account.address;
        }
        _this.accountAddress = (walletAccount === null || walletAccount === void 0 ? void 0 : walletAccount.address) || ((_a = walletProvider.eth.defaultAccount) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
        _this.orders = new index_1.Orders(walletProvider, apiConfig);
        _this.account = new account_1.Account(walletProvider, apiConfig);
        _this.gqlApi = {
            usersApi: new graphql_1.GqlApi.usersApi({ networkName: networkName, account: _this.accountAddress, apiBaseUrl: apiUrl }),
            assetsApi: new graphql_1.GqlApi.assetsApi({ networkName: networkName, account: _this.accountAddress, apiBaseUrl: apiUrl })
        };
        _this.walletProvider = walletProvider;
        return _this;
    }
    // 接口登录Token
    ElementOrders.prototype.getLoginAuthToken = function () {
        return __awaiter(this, void 0, void 0, function () {
            var accountAddress, nonce, _a, message, signature, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        accountAddress = this.accountAddress;
                        return [4 /*yield*/, this.gqlApi.usersApi.getNewNonce()];
                    case 1:
                        nonce = _c.sent();
                        return [4 /*yield*/, index_1.elementSignInSign(this.walletProvider, nonce, accountAddress)];
                    case 2:
                        _a = _c.sent(), message = _a.message, signature = _a.signature;
                        _b = this;
                        return [4 /*yield*/, this.gqlApi.usersApi.getSignInToken({ message: message, signature: signature })];
                    case 3:
                        _b.authToken = _c.sent();
                        return [2 /*return*/, this.authToken];
                }
            });
        });
    };
    ElementOrders.prototype.login = function () {
        return __awaiter(this, void 0, void 0, function () {
            var accountAddress, nonce, _a, message, signature, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        accountAddress = this.accountAddress;
                        return [4 /*yield*/, this.gqlApi.usersApi.getNewNonce()];
                    case 1:
                        nonce = _c.sent();
                        return [4 /*yield*/, index_1.elementSignInSign(this.walletProvider, nonce, accountAddress)];
                    case 2:
                        _a = _c.sent(), message = _a.message, signature = _a.signature;
                        _b = this;
                        return [4 /*yield*/, this.gqlApi.usersApi.getSignInToken({ message: message, signature: signature })];
                    case 3:
                        _b.authToken = _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // 取消订单签名
    ElementOrders.prototype.ordersCancelSign = function (hash) {
        return __awaiter(this, void 0, void 0, function () {
            var signature;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, index_1.web3Sign(this.account.web3, hash, this.accountAddress)];
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
            var orderAsset, orderVersion, newAsset, sharedAsset;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        orderAsset = {
                            contractAddress: assetData.tokenAddress,
                            tokenId: assetData.tokenId,
                            chain: this.chain,
                            chainId: this.walletChainId
                        };
                        return [4 /*yield*/, this.ordersVersion(orderAsset)
                            // console.log(orderAsset, orderVersion)
                        ];
                    case 1:
                        orderVersion = _a.sent();
                        // console.log(orderAsset, orderVersion)
                        if (!orderVersion.isTradable) {
                            throw new index_1.ElementError({ code: '1212' });
                        }
                        newAsset = __assign({}, assetData);
                        sharedAsset = this.orders.elementSharedAssetAddr.toLowerCase();
                        // console.log('getAssetOrderVersion', this.walletChainId, orderVersion)
                        if (orderVersion.orderVersion === 1 &&
                            orderAsset.contractAddress === sharedAsset &&
                            orderVersion.uri &&
                            !assetData.data) {
                            newAsset = __assign(__assign({}, assetData), { data: orderVersion.uri });
                        }
                        else {
                            if (assetData.schemaName === index_1.ElementSchemaName.ERC1155 && orderVersion.orderVersion === 0) {
                                newAsset = __assign(__assign({}, assetData), { data: '' });
                            }
                        }
                        return [2 /*return*/, { orderVersion: orderVersion, newAsset: newAsset }];
                }
            });
        });
    };
    // 创建卖单 一口价，荷兰拍
    ElementOrders.prototype.createSellOrder = function (_a) {
        var asset = _a.asset, _b = _a.quantity, quantity = _b === void 0 ? 1 : _b, _c = _a.paymentToken, paymentToken = _c === void 0 ? this.orders.ETH : _c, _d = _a.listingTime, listingTime = _d === void 0 ? 0 : _d, _e = _a.expirationTime, expirationTime = _e === void 0 ? 0 : _e, startAmount = _a.startAmount, endAmount = _a.endAmount, buyerAddress = _a.buyerAddress;
        return __awaiter(this, void 0, void 0, function () {
            var _f, orderVersion, newAsset, sellParams, sellData, order;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0: return [4 /*yield*/, this.getAssetOrderVersion(asset)];
                    case 1:
                        _f = _g.sent(), orderVersion = _f.orderVersion, newAsset = _f.newAsset;
                        sellParams = {
                            asset: newAsset,
                            quantity: quantity,
                            paymentTokenObj: paymentToken,
                            accountAddress: this.accountAddress,
                            startAmount: startAmount,
                            endAmount: endAmount,
                            listingTime: listingTime,
                            expirationTime: expirationTime,
                            buyerAddress: buyerAddress
                        };
                        return [4 /*yield*/, this.orders.createSellOrder(sellParams)
                            // const isCheckOrder = await checkOrder(this.orders, sellData)
                            // console.log('isCheckOrder', isCheckOrder, sellData)
                        ];
                    case 2:
                        sellData = _g.sent();
                        // const isCheckOrder = await checkOrder(this.orders, sellData)
                        // console.log('isCheckOrder', isCheckOrder, sellData)
                        if (!sellData)
                            return [2 /*return*/];
                        order = __assign(__assign({}, sellData), { version: orderVersion.orderVersion });
                        return [2 /*return*/, this.ordersPost({ order: order })];
                }
            });
        });
    };
    // 创建英拍 卖单
    ElementOrders.prototype.createAuctionOrder = function (_a) {
        var asset = _a.asset, quantity = _a.quantity, paymentToken = _a.paymentToken, expirationTime = _a.expirationTime, startAmount = _a.startAmount, englishAuctionReservePrice = _a.englishAuctionReservePrice;
        return __awaiter(this, void 0, void 0, function () {
            var _b, orderVersion, newAsset, sellParams, sellData, order;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.getAssetOrderVersion(asset)];
                    case 1:
                        _b = _c.sent(), orderVersion = _b.orderVersion, newAsset = _b.newAsset;
                        sellParams = {
                            asset: newAsset,
                            quantity: quantity,
                            paymentTokenObj: paymentToken,
                            accountAddress: this.accountAddress,
                            startAmount: startAmount,
                            englishAuctionReservePrice: englishAuctionReservePrice,
                            expirationTime: expirationTime,
                            waitForHighestBid: true
                        };
                        return [4 /*yield*/, this.orders.createSellOrder(sellParams)];
                    case 2:
                        sellData = _c.sent();
                        if (!sellData)
                            return [2 /*return*/];
                        order = __assign(__assign({}, sellData), { version: orderVersion.orderVersion });
                        return [2 /*return*/, this.ordersPost({ order: order })];
                }
            });
        });
    };
    //------------------ 买单---------------
    // 创建竞价 买单
    ElementOrders.prototype.createBiddingOrder = function (_a) {
        var asset = _a.asset, quantity = _a.quantity, paymentToken = _a.paymentToken, startAmount = _a.startAmount, bestAsk = _a.bestAsk;
        return __awaiter(this, void 0, void 0, function () {
            var askOrder, sellOrder, paymentTokenObj, _b, orderVersion, newAsset, biddingParams, buyData, order;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if ((bestAsk === null || bestAsk === void 0 ? void 0 : bestAsk.bestAskOrderType) === 0)
                            return [2 /*return*/];
                        askOrder = bestAsk ? JSON.parse(bestAsk === null || bestAsk === void 0 ? void 0 : bestAsk.bestAskOrderString) : false;
                        sellOrder = index_1.orderFromJSON(askOrder);
                        paymentTokenObj = __assign(__assign({}, paymentToken), { decimals: paymentToken === null || paymentToken === void 0 ? void 0 : paymentToken.decimals });
                        return [4 /*yield*/, this.getAssetOrderVersion(asset)];
                    case 1:
                        _b = _c.sent(), orderVersion = _b.orderVersion, newAsset = _b.newAsset;
                        biddingParams = {
                            asset: newAsset,
                            accountAddress: this.accountAddress,
                            startAmount: startAmount,
                            paymentTokenObj: paymentTokenObj,
                            expirationTime: sellOrder === null || sellOrder === void 0 ? void 0 : sellOrder.expirationTime.toNumber(),
                            quantity: sellOrder === null || sellOrder === void 0 ? void 0 : sellOrder.quantity.toNumber(),
                            sellOrder: sellOrder
                        };
                        return [4 /*yield*/, this.orders.createBuyOrder(biddingParams)];
                    case 2:
                        buyData = _c.sent();
                        if (!buyData)
                            return [2 /*return*/];
                        order = __assign(__assign({}, buyData), { version: orderVersion.orderVersion });
                        return [2 /*return*/, this.ordersPost({ order: order })];
                }
            });
        });
    };
    // 创建报价订单
    ElementOrders.prototype.createBuyOrder = function (_a) {
        var asset = _a.asset, quantity = _a.quantity, paymentToken = _a.paymentToken, expirationTime = _a.expirationTime, startAmount = _a.startAmount;
        return __awaiter(this, void 0, void 0, function () {
            var _b, orderVersion, newAsset, buyParams, buyData, order;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.getAssetOrderVersion(asset)];
                    case 1:
                        _b = _c.sent(), orderVersion = _b.orderVersion, newAsset = _b.newAsset;
                        paymentToken = paymentToken || this.orders.WETHToekn;
                        buyParams = {
                            asset: newAsset,
                            accountAddress: this.accountAddress,
                            startAmount: startAmount,
                            paymentTokenObj: paymentToken,
                            expirationTime: expirationTime,
                            quantity: quantity
                        };
                        return [4 /*yield*/, this.orders.createBuyOrder(buyParams)];
                    case 2:
                        buyData = _c.sent();
                        if (!buyData)
                            return [2 /*return*/];
                        order = __assign(__assign({}, buyData), { version: orderVersion.orderVersion });
                        return [2 /*return*/, this.ordersPost({ order: order })];
                }
            });
        });
    };
    //
    // // 创建降价单
    ElementOrders.prototype.createLowerPriceOrder = function (_a) {
        var oldOrder = _a.oldOrder, parameter = _a.parameter, asset = _a.asset;
        return __awaiter(this, void 0, void 0, function () {
            var metadataAsset, assetData, _b, orderVersion, newAsset, sharedAsset, unsignedOrder, _c, dataToCall, replacementPattern, unHashOrder, signOrder, order;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        metadataAsset = oldOrder.metadata.asset;
                        assetData = {
                            tokenAddress: metadataAsset.address,
                            tokenId: metadataAsset.id,
                            schemaName: oldOrder.metadata.schema
                        };
                        return [4 /*yield*/, this.getAssetOrderVersion(assetData)];
                    case 1:
                        _b = _d.sent(), orderVersion = _b.orderVersion, newAsset = _b.newAsset;
                        sharedAsset = this.orders.elementSharedAssetAddr.toLowerCase();
                        if (metadataAsset.address === sharedAsset && orderVersion.uri && orderVersion.orderVersion === 1) {
                            metadataAsset.data = newAsset.data;
                        }
                        unsignedOrder = __assign(__assign({}, oldOrder), parameter);
                        _c = index_1.computeOrderCallData(unsignedOrder, this.orders.networkName, this.accountAddress), dataToCall = _c.dataToCall, replacementPattern = _c.replacementPattern;
                        unHashOrder = __assign(__assign({}, unsignedOrder), { dataToCall: dataToCall, replacementPattern: replacementPattern, makerReferrerFee: index_1.makeBigNumber(0) });
                        return [4 /*yield*/, this.orders.creatSignedOrder({ unHashOrder: unHashOrder })];
                    case 2:
                        signOrder = _d.sent();
                        if (!signOrder)
                            return [2 /*return*/];
                        order = __assign(__assign({}, signOrder), { version: orderVersion.orderVersion });
                        return [2 /*return*/, this.ordersPost({ order: order })];
                }
            });
        });
    };
    //撮合 接受买单/购买-----------------order match
    ElementOrders.prototype.acceptOrder = function (bestOrder) {
        return __awaiter(this, void 0, void 0, function () {
            var accountAddress, signedOrder, recipientAddress, _a, buy, sell, res;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        accountAddress = this.accountAddress;
                        signedOrder = checkOrderHash(bestOrder);
                        recipientAddress = '';
                        if (bestOrder.side === index_1.OrderSide.Sell) {
                            recipientAddress = accountAddress;
                        }
                        if (bestOrder.side === index_1.OrderSide.Buy) {
                            recipientAddress = bestOrder.maker;
                        }
                        _a = this.orders.makeMatchingOrder({ signedOrder: signedOrder, accountAddress: accountAddress, recipientAddress: recipientAddress }), buy = _a.buy, sell = _a.sell;
                        return [4 /*yield*/, this.account.orderMatch({
                                buy: buy,
                                sell: sell
                            })];
                    case 1:
                        res = _b.sent();
                        return [2 /*return*/, res];
                }
            });
        });
    };
    return ElementOrders;
}(ordersApi_1.OrdersAPI));
exports.ElementOrders = ElementOrders;
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
