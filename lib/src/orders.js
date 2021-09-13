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
exports.Orders = exports.OrderCheckStatus = void 0;
var types_1 = require("./types");
var constants_1 = require("./utils/constants");
var check_1 = require("./utils/check");
var makeOrder_1 = require("./utils/makeOrder");
var helper_1 = require("./utils/helper");
var contracts_1 = require("./contracts");
var OrderCheckStatus;
(function (OrderCheckStatus) {
    OrderCheckStatus["StartOrderHashSign"] = "startOrderHashSign";
    OrderCheckStatus["EndOrderHashSign"] = "endOrderHashSign";
    OrderCheckStatus["StartOrderMatch"] = "startOrderMatch";
    OrderCheckStatus["OrderMatchTxHash"] = "orderMatchTxHash";
    OrderCheckStatus["EndOrderMatch"] = "endOrderMatch";
    OrderCheckStatus["StartCancelOrder"] = "startCancelOrder";
    OrderCheckStatus["EndCancelOrder"] = "endCancelOrder";
    OrderCheckStatus["RegisterTxHash"] = "registerTxHash";
    OrderCheckStatus["EndRegister"] = "endRegister";
    OrderCheckStatus["ApproveErc20TxHash"] = "approveErc20TxHash";
    OrderCheckStatus["EndApproveErc20"] = "endApproveErc20";
    OrderCheckStatus["ApproveErc721TxHash"] = "approveErc721TxHash";
    OrderCheckStatus["EndApproveErc721"] = "endApproveErc721";
    OrderCheckStatus["ApproveErc1155TxHash"] = "approveErc1155TxHash";
    OrderCheckStatus["EndApproveErc1155"] = "endApproveErc1155";
    OrderCheckStatus["TransferErc1155"] = "transferErc1155";
    OrderCheckStatus["TransferErc721"] = "transferErc721";
    OrderCheckStatus["End"] = "End";
})(OrderCheckStatus = exports.OrderCheckStatus || (exports.OrderCheckStatus = {}));
// 根据 DB签名过的订单 make一个对手单
var Orders = /** @class */ (function (_super) {
    __extends(Orders, _super);
    function Orders() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Orders.prototype.makeMatchingOrder = function (_a) {
        var signedOrder = _a.signedOrder, accountAddress = _a.accountAddress, recipientAddress = _a.recipientAddress;
        var networkName = this.networkName;
        var assetRecipientAddress = recipientAddress;
        if (!assetRecipientAddress || signedOrder.side == types_1.OrderSide.Buy) {
            assetRecipientAddress = accountAddress;
        }
        var feeRecipientAddress = this.feeRecipientAddress;
        var matchingOrder = makeOrder_1._makeMatchingOrder({
            networkName: networkName,
            unSignedOrder: signedOrder,
            accountAddress: accountAddress,
            assetRecipientAddress: assetRecipientAddress,
            feeRecipientAddress: feeRecipientAddress
        });
        // 伪造买单  对手单
        var unsignData = __assign(__assign({}, matchingOrder), { hash: signedOrder.hash });
        return makeOrder_1.assignOrdersToSides(signedOrder, unsignData);
    };
    // // 撮合订单
    // async orderMatch(
    //   {
    //     buy,
    //     sell,
    //     accountAddress,
    //     metadata = '0x'
    //   }: {
    //     buy: Order
    //     sell: Order
    //     accountAddress: string
    //     metadata?: string
    //   },
    //   callBack?: CallBack
    // ): Promise<any> {
    //   await checkMatchOrder(this, buy, sell)
    //
    //   const sellOrderParamArray = orderParamsEncode(sell as UnhashedOrder)
    //   const sellOrderSigArray = orderSigEncode(sell as ECSignature)
    //   const buyOrderParamArray = orderParamsEncode(buy as UnhashedOrder)
    //   const buyOrderSigArray = orderSigEncode(buy as ECSignature)
    //   callBack?.next(OrderCheckStatus.StartOrderMatch, { buy, sell })
    //
    //   const value = buy.paymentToken !== NULL_ADDRESS ? 0 : buy.basePrice
    //
    //   // metadata = '0x'
    //
    //   const data = await this.exchange.methods
    //     .orderMatch(buyOrderParamArray, buyOrderSigArray, sellOrderParamArray, sellOrderSigArray, metadata)
    //     .encodeABI()
    //   const gas = await this.web3.eth
    //     .estimateGas({ to: this.exchange.options.address, data, value })
    //     .catch((error: any) => {
    //       throw new ElementError({ code: '1003', context: { msg: error.message } })
    //     })
    //
    //   return this.exchange.methods
    //     .orderMatch(buyOrderParamArray, buyOrderSigArray, sellOrderParamArray, sellOrderSigArray, metadata)
    //     .send({
    //       gas,
    //       value,
    //       from: accountAddress
    //     })
    //     .on('transactionHash', (txHash: string) => {
    //       callBack?.next(OrderCheckStatus.OrderMatchTxHash, { txHash, buy, sell, accountAddress })
    //     })
    //     .on('receipt', (receipt: string) => {
    //       callBack?.next(OrderCheckStatus.EndOrderMatch, { receipt, buy, sell })
    //     })
    //     .on('error', console.error) // 如果是 out of gas 错误, 第二个参数为交易收据
    //     .catch((error: any) => {
    //       if (error.code == '4001') {
    //         throw new ElementError(error)
    //       } else {
    //         throw new ElementError({ code: '1004', context: { msg: error.message } })
    //       }
    //     })
    // }
    Orders.prototype.creatSignedOrder = function (_a, callBack) {
        var unHashOrder = _a.unHashOrder;
        return __awaiter(this, void 0, void 0, function () {
            var signSellOrder, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, check_1.checkUnhashedOrder(this, unHashOrder)];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        callBack === null || callBack === void 0 ? void 0 : callBack.next(OrderCheckStatus.StartOrderHashSign, { unHashOrder: unHashOrder });
                        return [4 /*yield*/, makeOrder_1.hashAndValidateOrder(this.web3, this.exchangeHelper, unHashOrder)];
                    case 3:
                        signSellOrder = _b.sent();
                        callBack === null || callBack === void 0 ? void 0 : callBack.next(OrderCheckStatus.EndOrderHashSign, { signSellOrder: signSellOrder });
                        return [2 /*return*/, signSellOrder];
                    case 4:
                        error_1 = _b.sent();
                        if (error_1.data) {
                            error_1.data.order = unHashOrder;
                        }
                        else {
                            // eslint-disable-next-line no-ex-assign
                            error_1 = __assign(__assign({}, error_1), { message: error_1.message, data: { order: unHashOrder } });
                        }
                        throw error_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    Orders.prototype.createBuyOrder = function (_a, callBack) {
        var asset = _a.asset, accountAddress = _a.accountAddress, startAmount = _a.startAmount, paymentTokenObj = _a.paymentTokenObj, _b = _a.quantity, quantity = _b === void 0 ? 1 : _b, _c = _a.expirationTime, expirationTime = _c === void 0 ? 0 : _c, sellOrder = _a.sellOrder, referrerAddress = _a.referrerAddress;
        return __awaiter(this, void 0, void 0, function () {
            var networkName, exchangeAddr, buyOrder;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        networkName = this.networkName;
                        exchangeAddr = this.exchange.options.address;
                        return [4 /*yield*/, makeOrder_1._makeBuyOrder({
                                networkName: networkName,
                                exchangeAddr: exchangeAddr,
                                asset: asset,
                                quantity: quantity,
                                accountAddress: accountAddress,
                                startAmount: startAmount,
                                expirationTime: expirationTime,
                                paymentTokenObj: paymentTokenObj,
                                extraBountyBasisPoints: 0,
                                feeRecipientAddr: this.feeRecipientAddress,
                                sellOrder: sellOrder,
                                referrerAddress: referrerAddress
                            })];
                    case 1:
                        buyOrder = _d.sent();
                        return [2 /*return*/, this.creatSignedOrder({ unHashOrder: buyOrder }, callBack)];
                }
            });
        });
    };
    Orders.prototype.createSellOrder = function (_a, callBack) {
        var asset = _a.asset, accountAddress = _a.accountAddress, startAmount = _a.startAmount, _b = _a.paymentTokenObj, paymentTokenObj = _b === void 0 ? this.ETH : _b, endAmount = _a.endAmount, _c = _a.quantity, quantity = _c === void 0 ? 1 : _c, listingTime = _a.listingTime, _d = _a.expirationTime, expirationTime = _d === void 0 ? 0 : _d, _e = _a.waitForHighestBid, waitForHighestBid = _e === void 0 ? false : _e, englishAuctionReservePrice = _a.englishAuctionReservePrice, _f = _a.extraBountyBasisPoints, extraBountyBasisPoints = _f === void 0 ? 0 : _f, buyerAddress = _a.buyerAddress, buyerEmail = _a.buyerEmail;
        return __awaiter(this, void 0, void 0, function () {
            var networkName, exchangeAddr, sellOrder;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        expirationTime = expirationTime ? parseInt(String(expirationTime)) : expirationTime;
                        networkName = this.networkName;
                        exchangeAddr = this.exchange.options.address;
                        return [4 /*yield*/, makeOrder_1._makeSellOrder({
                                networkName: networkName,
                                exchangeAddr: exchangeAddr,
                                asset: asset,
                                quantity: quantity,
                                accountAddress: accountAddress,
                                startAmount: startAmount,
                                endAmount: endAmount,
                                listingTime: listingTime,
                                expirationTime: expirationTime,
                                waitForHighestBid: waitForHighestBid,
                                englishAuctionReservePrice: englishAuctionReservePrice,
                                paymentTokenObj: paymentTokenObj,
                                extraBountyBasisPoints: extraBountyBasisPoints,
                                feeRecipientAddr: this.feeRecipientAddress,
                                buyerAddress: buyerAddress || constants_1.NULL_ADDRESS
                            })];
                    case 1:
                        sellOrder = _g.sent();
                        return [2 /*return*/, this.creatSignedOrder({ unHashOrder: sellOrder }, callBack)];
                }
            });
        });
    };
    // public async cancelOrder(
    //   { order, accountAddress }: { order: Order; accountAddress: string },
    //   callBack?: CallBack
    // ): Promise<any> {
    //   if (order.maker.toLowerCase() !== accountAddress.toLowerCase()) {
    //     throw new ElementError({ code: '1000', message: 'CancelOrder order.maker not equle accountAddress' })
    //   }
    //
    //   // await checkOrderCancelledOrFinalized(this, order)
    //
    //   const orderParamArray = orderParamsEncode(order)
    //   const orderSigArray = orderSigEncode(order as ECSignature)
    //   // callBack?.next(OrderCheckStatus.StartCancelOrder)
    //   return this.exchange.methods
    //     .cancelOrder(orderParamArray, orderSigArray)
    //     .send({
    //       from: order.maker
    //     })
    //     .on('transactionHash', (txHash: string) => {
    //       // callBack?.next(OrderCheckStatus.StartCancelOrder, { txHash, order, accountAddress })
    //       console.log('transactionHash：', txHash)
    //       this.emit('transactionHash', { txHash, order, accountAddress })
    //     })
    //     .on('confirmation', (receipt: any) => {
    //       console.log('confirmation：', receipt)
    //     })
    //     .on('receipt', (receipt: any) => {
    //       // callBack?.next(OrderCheckStatus.EndCancelOrder, { receipt, order })
    //       console.log('receipt：', receipt)
    //       this.emit('transactionHash', { receipt, order })
    //     })
    //     .on('error', (error: any, receipt: any) => {
    //       // 如果是 out of gas 错误, 第二个参数为交易收据
    //       console.log(error)
    //     })
    //     .catch((error: any) => {
    //       if (error.code == '4001') {
    //         throw new ElementError(error)
    //       } else {
    //         throw new ElementError({ code: '1000', message: 'CancelOrder failure' })
    //       }
    //     })
    // }
    //计算当前 订单的总价格
    Orders.prototype.getOrderCurrentPrice = function (order) {
        var _a, _b, _c, _d, _e, _f;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_g) {
                return [2 /*return*/, this.exchangeHelper.methods
                        .calculateFinalPrice((_a = order.side) === null || _a === void 0 ? void 0 : _a.toString(), (_b = order.saleKind) === null || _b === void 0 ? void 0 : _b.toString(), (_c = order.basePrice) === null || _c === void 0 ? void 0 : _c.toString(), (_d = order.extra) === null || _d === void 0 ? void 0 : _d.toString(), (_e = order.listingTime) === null || _e === void 0 ? void 0 : _e.toString(), (_f = order.expirationTime) === null || _f === void 0 ? void 0 : _f.toString())
                        .call()];
            });
        });
    };
    Orders.prototype.getOrderCancelledOrFinalized = function (order) {
        return __awaiter(this, void 0, void 0, function () {
            var orderParamValueArray, hash;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        orderParamValueArray = helper_1.orderParamsEncode(order);
                        return [4 /*yield*/, this.exchangeHelper.methods.hashToSign(orderParamValueArray).call()];
                    case 1:
                        hash = _a.sent();
                        return [2 /*return*/, this.exchange.methods.cancelledOrFinalized(hash).call()];
                }
            });
        });
    };
    Orders.prototype.checkMatchOrder = function (buy, sell) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, check_1.checkMatchOrder(this, buy, sell)];
            });
        });
    };
    Orders.prototype.checkOrder = function (order) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, check_1.checkOrder(this, order)];
            });
        });
    };
    return Orders;
}(contracts_1.Contracts));
exports.Orders = Orders;
