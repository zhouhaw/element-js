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
var error_1 = require("./base/error");
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
    // 撮合订单
    Orders.prototype.orderMatch = function (_a, callBack) {
        var buy = _a.buy, sell = _a.sell, accountAddress = _a.accountAddress, _b = _a.metadata, metadata = _b === void 0 ? '0x' : _b;
        return __awaiter(this, void 0, void 0, function () {
            var sellOrderParamArray, sellOrderSigArray, buyOrderParamArray, buyOrderSigArray, value, data, gas;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, check_1.checkMatchOrder(this, buy, sell)];
                    case 1:
                        _c.sent();
                        sellOrderParamArray = helper_1.orderParamsEncode(sell);
                        sellOrderSigArray = helper_1.orderSigEncode(sell);
                        buyOrderParamArray = helper_1.orderParamsEncode(buy);
                        buyOrderSigArray = helper_1.orderSigEncode(buy);
                        callBack === null || callBack === void 0 ? void 0 : callBack.next(OrderCheckStatus.StartOrderMatch, { buy: buy, sell: sell });
                        value = buy.paymentToken !== constants_1.NULL_ADDRESS ? 0 : buy.basePrice;
                        return [4 /*yield*/, this.exchange.methods
                                .orderMatch(buyOrderParamArray, buyOrderSigArray, sellOrderParamArray, sellOrderSigArray, metadata)
                                .encodeABI()];
                    case 2:
                        data = _c.sent();
                        console.log(data);
                        return [4 /*yield*/, this.web3.eth
                                .estimateGas({ to: this.exchange.options.address, data: data, value: value })
                                .catch(function (error) {
                                throw new error_1.ElementError({ code: '1003', context: { msg: error.message } });
                            })];
                    case 3:
                        gas = _c.sent();
                        console.log(gas);
                        return [2 /*return*/, this.exchange.methods
                                .orderMatch(buyOrderParamArray, buyOrderSigArray, sellOrderParamArray, sellOrderSigArray, metadata)
                                .send({
                                gas: gas,
                                value: value,
                                from: accountAddress
                            })
                                .on('transactionHash', function (txHash) {
                                callBack === null || callBack === void 0 ? void 0 : callBack.next(OrderCheckStatus.OrderMatchTxHash, { txHash: txHash, buy: buy, sell: sell, accountAddress: accountAddress });
                            })
                                .on('receipt', function (receipt) {
                                callBack === null || callBack === void 0 ? void 0 : callBack.next(OrderCheckStatus.EndOrderMatch, { receipt: receipt, buy: buy, sell: sell });
                            })
                                .on('error', console.error) // 如果是 out of gas 错误, 第二个参数为交易收据
                                .catch(function (error) {
                                if (error.code == '4001') {
                                    throw new error_1.ElementError(error);
                                }
                                else {
                                    throw new error_1.ElementError({ code: '1004', context: { msg: error.message } });
                                }
                            })];
                }
            });
        });
    };
    Orders.prototype.creatSignedOrder = function (_a, callBack) {
        var unHashOrder = _a.unHashOrder;
        return __awaiter(this, void 0, void 0, function () {
            var signSellOrder, error_2;
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
                        error_2 = _b.sent();
                        if (error_2.data) {
                            error_2.data.order = unHashOrder;
                        }
                        else {
                            // eslint-disable-next-line no-ex-assign
                            error_2 = __assign(__assign({}, error_2), { message: error_2.message, data: { order: unHashOrder } });
                        }
                        throw error_2;
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
    Orders.prototype.cancelOrder = function (_a, callBack) {
        var order = _a.order, accountAddress = _a.accountAddress;
        return __awaiter(this, void 0, void 0, function () {
            var orderParamArray, orderSigArray;
            var _this = this;
            return __generator(this, function (_b) {
                if (order.maker.toLowerCase() !== accountAddress.toLowerCase()) {
                    throw new error_1.ElementError({ code: '1000', message: 'CancelOrder order.maker not equle accountAddress' });
                }
                orderParamArray = helper_1.orderParamsEncode(order);
                orderSigArray = helper_1.orderSigEncode(order);
                // callBack?.next(OrderCheckStatus.StartCancelOrder)
                return [2 /*return*/, this.exchange.methods
                        .cancelOrder(orderParamArray, orderSigArray)
                        .send({
                        from: order.maker
                    })
                        .on('transactionHash', function (txHash) {
                        // callBack?.next(OrderCheckStatus.StartCancelOrder, { txHash, order, accountAddress })
                        console.log('transactionHash：', txHash);
                        _this.emit('transactionHash', { txHash: txHash, order: order, accountAddress: accountAddress });
                    })
                        .on('confirmation', function (receipt) {
                        console.log('confirmation：', receipt);
                    })
                        .on('receipt', function (receipt) {
                        // callBack?.next(OrderCheckStatus.EndCancelOrder, { receipt, order })
                        console.log('receipt：', receipt);
                        _this.emit('transactionHash', { receipt: receipt, order: order });
                    })
                        .on('error', function (error, receipt) {
                        // 如果是 out of gas 错误, 第二个参数为交易收据
                        console.log(error);
                    })
                        .catch(function (error) {
                        if (error.code == '4001') {
                            throw new error_1.ElementError(error);
                        }
                        else {
                            throw new error_1.ElementError({ code: '1000', message: 'CancelOrder failure' });
                        }
                    })];
            });
        });
    };
    return Orders;
}(contracts_1.Contracts));
exports.Orders = Orders;
