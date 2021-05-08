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
exports.Orders = void 0;
var utils_1 = require("./utils");
var contracts_1 = require("./contracts");
var Orders = /** @class */ (function (_super) {
    __extends(Orders, _super);
    function Orders() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Orders.prototype.matchOrder = function (_a) {
        var asset = _a.asset, accountAddress = _a.accountAddress, startAmount = _a.startAmount, _b = _a.quantity, quantity = _b === void 0 ? 1 : _b, _c = _a.expirationTime, expirationTime = _c === void 0 ? 0 : _c, _d = _a.paymentTokenAddress, paymentTokenAddress = _d === void 0 ? utils_1.NULL_ADDRESS : _d, sellOrder = _a.sellOrder, referrerAddress = _a.referrerAddress;
        return __awaiter(this, void 0, void 0, function () {
            var aproveToken, isTransferApprove, buyOrder, orderHash, hashedOrder, signature, buyOrderWithSignature, buyIsValid, sellIsValid, sellOrderParamArray, sellOrderSigArray, buyOrderParamArray, buyOrderSigArray, isMatch, matchTx;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: 
                    // check register
                    return [4 /*yield*/, utils_1.registerProxy(this.exchangeProxyRegistry, accountAddress)
                        // check approve token
                    ];
                    case 1:
                        // check register
                        _e.sent();
                        if (!(paymentTokenAddress !== utils_1.NULL_ADDRESS)) return [3 /*break*/, 3];
                        aproveToken = this.erc20.clone();
                        aproveToken.options.address = paymentTokenAddress;
                        return [4 /*yield*/, utils_1.approveTokenTransferProxy(this.exchange, aproveToken, accountAddress)];
                    case 2:
                        isTransferApprove = _e.sent();
                        if (!isTransferApprove) {
                            return [2 /*return*/, false];
                        }
                        _e.label = 3;
                    case 3: return [4 /*yield*/, utils_1._makeBuyOrder({
                            networkName: this.networkName,
                            exchangeAddr: this.exchange.options.address,
                            asset: asset,
                            quantity: quantity,
                            accountAddress: accountAddress,
                            startAmount: startAmount,
                            expirationTime: expirationTime,
                            paymentTokenAddress: paymentTokenAddress,
                            extraBountyBasisPoints: 0,
                            sellOrder: sellOrder,
                            referrerAddress: referrerAddress
                        })];
                    case 4:
                        buyOrder = _e.sent();
                        return [4 /*yield*/, utils_1.getOrderHash(this.web3, this.exchangeHelper, buyOrder)];
                    case 5:
                        orderHash = _e.sent();
                        hashedOrder = __assign(__assign({}, buyOrder), { hash: orderHash });
                        return [4 /*yield*/, utils_1.signOrderHash(this.web3, hashedOrder)];
                    case 6:
                        signature = _e.sent();
                        buyOrderWithSignature = __assign(__assign({}, hashedOrder), signature);
                        return [4 /*yield*/, utils_1.validateOrder(this.exchangeHelper, buyOrderWithSignature)];
                    case 7:
                        buyIsValid = _e.sent();
                        return [4 /*yield*/, utils_1.validateOrder(this.exchangeHelper, sellOrder)];
                    case 8:
                        sellIsValid = _e.sent();
                        if (!(sellIsValid && buyIsValid)) return [3 /*break*/, 10];
                        sellOrderParamArray = utils_1.orderParamsEncode(sellOrder);
                        sellOrderSigArray = utils_1.orderSigEncode(sellOrder);
                        buyOrderParamArray = utils_1.orderParamsEncode(buyOrderWithSignature);
                        buyOrderSigArray = utils_1.orderSigEncode(buyOrderWithSignature);
                        isMatch = utils_1.orderCanMatch(buyOrderWithSignature, sellOrder);
                        return [4 /*yield*/, this.exchange.methods
                                .orderMatch(buyOrderParamArray, buyOrderSigArray, sellOrderParamArray, sellOrderSigArray, '0x0000000000000000000000000000000000000000000000000000000000000000')
                                .send({
                                value: buyOrder.paymentToken !== utils_1.NULL_ADDRESS ? 0 : buyOrder.basePrice,
                                from: buyOrder.maker,
                                gas: (80e4).toString()
                            })
                                .catch(function (error) {
                                console.error(error.receipt); //, error.message
                                return false;
                            })];
                    case 9:
                        matchTx = _e.sent();
                        console.log('exchange.methods.orderMatch', matchTx.status);
                        _e.label = 10;
                    case 10: return [2 /*return*/, true];
                }
            });
        });
    };
    // -------------- Buy ---------------------
    Orders.prototype.createBuyOrder = function (_a) {
        var asset = _a.asset, accountAddress = _a.accountAddress, startAmount = _a.startAmount, _b = _a.quantity, quantity = _b === void 0 ? 1 : _b, _c = _a.expirationTime, expirationTime = _c === void 0 ? 0 : _c, _d = _a.paymentTokenAddress, paymentTokenAddress = _d === void 0 ? this.WETHAddr : _d, sellOrder = _a.sellOrder, referrerAddress = _a.referrerAddress;
        return __awaiter(this, void 0, void 0, function () {
            var networkName, exchangeAddr, buyOrder, orderHash, hashedOrder, signature, orderWithSignature, isValid;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: 
                    // exchangeProxyRegistry
                    return [4 /*yield*/, utils_1.registerProxy(this.exchangeProxyRegistry, accountAddress)];
                    case 1:
                        // exchangeProxyRegistry
                        _e.sent();
                        networkName = this.networkName;
                        exchangeAddr = this.exchange.options.address;
                        return [4 /*yield*/, utils_1._makeBuyOrder({
                                networkName: networkName,
                                exchangeAddr: exchangeAddr,
                                asset: asset,
                                quantity: quantity,
                                accountAddress: accountAddress,
                                startAmount: startAmount,
                                expirationTime: expirationTime,
                                paymentTokenAddress: paymentTokenAddress,
                                extraBountyBasisPoints: 0,
                                sellOrder: sellOrder,
                                referrerAddress: referrerAddress
                            })];
                    case 2:
                        buyOrder = _e.sent();
                        return [4 /*yield*/, utils_1.getOrderHash(this.web3, this.exchangeHelper, buyOrder)
                            // hashOrder(this.web3, order)
                        ];
                    case 3:
                        orderHash = _e.sent();
                        hashedOrder = __assign(__assign({}, buyOrder), { hash: orderHash });
                        return [4 /*yield*/, utils_1.signOrderHash(this.web3, hashedOrder)];
                    case 4:
                        signature = _e.sent();
                        orderWithSignature = __assign(__assign({}, hashedOrder), signature);
                        return [4 /*yield*/, utils_1.validateOrder(this.exchangeHelper, orderWithSignature)];
                    case 5:
                        isValid = _e.sent();
                        if (isValid) {
                            return [2 /*return*/, utils_1.orderToJSON(orderWithSignature)]; // validateAndPostOrder(this.web3, hashedOrder)
                        }
                        return [2 /*return*/, false];
                }
            });
        });
    };
    // ------------- Sell-------------------------
    Orders.prototype.createSellOrder = function (_a) {
        var asset = _a.asset, accountAddress = _a.accountAddress, startAmount = _a.startAmount, endAmount = _a.endAmount, _b = _a.quantity, quantity = _b === void 0 ? 1 : _b, listingTime = _a.listingTime, _c = _a.expirationTime, expirationTime = _c === void 0 ? 0 : _c, _d = _a.waitForHighestBid, waitForHighestBid = _d === void 0 ? false : _d, englishAuctionReservePrice = _a.englishAuctionReservePrice, paymentTokenAddress = _a.paymentTokenAddress, _e = _a.extraBountyBasisPoints, extraBountyBasisPoints = _e === void 0 ? 0 : _e, buyerAddress = _a.buyerAddress, buyerEmail = _a.buyerEmail;
        return __awaiter(this, void 0, void 0, function () {
            var networkName, exchangeAddr, order, orderHash, hashedOrder, signature, orderWithSignature, isValid;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        networkName = this.networkName;
                        exchangeAddr = this.exchange.options.address;
                        return [4 /*yield*/, utils_1._makeSellOrder({
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
                                paymentTokenAddress: paymentTokenAddress || utils_1.NULL_ADDRESS,
                                extraBountyBasisPoints: extraBountyBasisPoints,
                                buyerAddress: buyerAddress || utils_1.NULL_ADDRESS
                            })];
                    case 1:
                        order = _f.sent();
                        return [4 /*yield*/, utils_1.getOrderHash(this.web3, this.exchangeHelper, order)];
                    case 2:
                        orderHash = _f.sent();
                        hashedOrder = __assign(__assign({}, order), { hash: orderHash });
                        return [4 /*yield*/, utils_1.signOrderHash(this.web3, hashedOrder)];
                    case 3:
                        signature = _f.sent();
                        orderWithSignature = __assign(__assign({}, hashedOrder), signature);
                        return [4 /*yield*/, utils_1.validateOrder(this.exchangeHelper, orderWithSignature)];
                    case 4:
                        isValid = _f.sent();
                        if (isValid) {
                            return [2 /*return*/, utils_1.orderToJSON(orderWithSignature)]; // validateAndPostOrder(this.web3, hashedOrder)
                        }
                        return [2 /*return*/, false];
                }
            });
        });
    };
    return Orders;
}(contracts_1.Contracts));
exports.Orders = Orders;
