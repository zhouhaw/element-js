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
var types_1 = require("./types");
var utils_1 = require("./utils");
var contracts_1 = require("./contracts");
var NULL_BLOCK_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000';
var Orders = /** @class */ (function (_super) {
    __extends(Orders, _super);
    function Orders() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Orders.prototype.matchOrder = function (_a) {
        var buy = _a.buy, sell = _a.sell, accountAddress = _a.accountAddress, _b = _a.metadata, metadata = _b === void 0 ? NULL_BLOCK_HASH : _b;
        return __awaiter(this, void 0, void 0, function () {
            var equalPrice, bal, ethBal, erc20Contract, erc20Bal, isApproveTokenTransfer, isApproveAssetTransfer, buyIsValid, sellIsValid, canMatch, sellOrderParamArray, sellOrderSigArray, buyOrderParamArray, buyOrderSigArray, matchTx;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        equalPrice = buy.basePrice.eq(sell.basePrice);
                        if (!equalPrice) {
                            console.log('matchOrder:buy.basePrice and sell.basePrice not equal!');
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, utils_1.getAccountNFTsBalance(this.elementSharedAsset, sell.maker, sell.metadata.asset.id)];
                    case 1:
                        bal = _c.sent();
                        if (bal == 0) {
                            console.log('matchOrder:elementSharedAsset balanceOf equal 0 !');
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, utils_1.getAccountBalance(this.web3, accountAddress)];
                    case 2:
                        ethBal = (_c.sent()).ethBal;
                        if (ethBal == 0) {
                            console.log('matchOrder:ETH balance equal 0');
                            return [2 /*return*/, false];
                        }
                        if (!(buy.paymentToken != utils_1.NULL_ADDRESS)) return [3 /*break*/, 5];
                        erc20Contract = this.erc20.clone();
                        erc20Contract.options.address = buy.paymentToken;
                        return [4 /*yield*/, utils_1.getAccountBalance(this.web3, buy.maker, erc20Contract)];
                    case 3:
                        erc20Bal = (_c.sent()).erc20Bal;
                        if (erc20Bal == 0) {
                            console.log('matchOrder:erc20Bal balance equal 0');
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, utils_1.checkApproveTokenTransferProxy(this.exchange, erc20Contract, buy.maker)];
                    case 4:
                        isApproveTokenTransfer = _c.sent();
                        if (!isApproveTokenTransfer) {
                            console.log('matchOrder:isApproveTokenTransfer ');
                            return [2 /*return*/, false];
                        }
                        _c.label = 5;
                    case 5:
                        if (!(sell.metadata.schema == types_1.ElementSchemaName.ERC1155)) return [3 /*break*/, 7];
                        return [4 /*yield*/, utils_1.checkApproveERC1155TransferProxy(this.exchangeProxyRegistry, this.elementSharedAsset, sell.maker)];
                    case 6:
                        isApproveAssetTransfer = _c.sent();
                        if (!isApproveAssetTransfer) {
                            console.log('matchOrder:isApproveAssetTransfer ');
                            return [2 /*return*/, false];
                        }
                        _c.label = 7;
                    case 7: return [4 /*yield*/, utils_1.validateOrder(this.exchangeHelper, buy)];
                    case 8:
                        buyIsValid = _c.sent();
                        return [4 /*yield*/, utils_1.validateOrder(this.exchangeHelper, sell)];
                    case 9:
                        sellIsValid = _c.sent();
                        if (!sellIsValid && !buyIsValid) {
                            console.log('matchOrder: validateOrder false');
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, utils_1.ordersCanMatch(this.exchangeHelper, buy, sell)];
                    case 10:
                        canMatch = _c.sent();
                        if (!canMatch) {
                            console.log('matchOrder: canMatch false');
                            return [2 /*return*/, false];
                        }
                        sellOrderParamArray = utils_1.orderParamsEncode(sell);
                        sellOrderSigArray = utils_1.orderSigEncode(sell);
                        buyOrderParamArray = utils_1.orderParamsEncode(buy);
                        buyOrderSigArray = utils_1.orderSigEncode(buy);
                        return [4 /*yield*/, this.exchange.methods
                                .orderMatch(buyOrderParamArray, buyOrderSigArray, sellOrderParamArray, sellOrderSigArray, metadata)
                                .send({
                                value: buy.paymentToken !== utils_1.NULL_ADDRESS ? 0 : buy.basePrice,
                                from: accountAddress,
                                gas: (80e4).toString()
                            })
                                .catch(function (error) {
                                console.error(error.receipt); //, error.message
                                return false;
                            })];
                    case 11:
                        matchTx = _c.sent();
                        return [2 /*return*/, matchTx.status];
                }
            });
        });
    };
    Orders.prototype.createBuyOrder = function (_a) {
        var asset = _a.asset, accountAddress = _a.accountAddress, startAmount = _a.startAmount, _b = _a.quantity, quantity = _b === void 0 ? 1 : _b, _c = _a.expirationTime, expirationTime = _c === void 0 ? 0 : _c, _d = _a.paymentTokenAddress, paymentTokenAddress = _d === void 0 ? this.WETHAddr : _d, sellOrder = _a.sellOrder, referrerAddress = _a.referrerAddress;
        return __awaiter(this, void 0, void 0, function () {
            var isRegister, isApproveWETH, networkName, exchangeAddr, buyOrder, erc20Contract, erc20Bal, isApproveTokenTransfer;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, utils_1.registerProxy(this.exchangeProxyRegistry, accountAddress)];
                    case 1:
                        isRegister = _e.sent();
                        if (!isRegister) {
                            console.log('isRegister false');
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, utils_1.approveTokenTransferProxy(this.exchange, this.WETH, accountAddress)];
                    case 2:
                        isApproveWETH = _e.sent();
                        if (!isApproveWETH) {
                            console.log('isApproveWETH false');
                            return [2 /*return*/, false];
                        }
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
                    case 3:
                        buyOrder = _e.sent();
                        if (!(buyOrder.paymentToken != utils_1.NULL_ADDRESS)) return [3 /*break*/, 6];
                        erc20Contract = this.erc20.clone();
                        erc20Contract.options.address = buyOrder.paymentToken;
                        return [4 /*yield*/, utils_1.getAccountBalance(this.web3, buyOrder.maker, erc20Contract)];
                    case 4:
                        erc20Bal = (_e.sent()).erc20Bal;
                        if (erc20Bal == 0) {
                            console.log('matchOrder:erc20Bal balance equal 0');
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, utils_1.approveTokenTransferProxy(this.exchange, erc20Contract, buyOrder.maker)];
                    case 5:
                        isApproveTokenTransfer = _e.sent();
                        if (!isApproveTokenTransfer) {
                            console.log('matchOrder:isApproveTokenTransfer ');
                            return [2 /*return*/, false];
                        }
                        _e.label = 6;
                    case 6: return [2 /*return*/, utils_1.hashAndValidateOrder(this.web3, this.exchangeHelper, buyOrder)];
                }
            });
        });
    };
    Orders.prototype.createSellOrder = function (_a) {
        var asset = _a.asset, accountAddress = _a.accountAddress, startAmount = _a.startAmount, endAmount = _a.endAmount, _b = _a.quantity, quantity = _b === void 0 ? 1 : _b, listingTime = _a.listingTime, _c = _a.expirationTime, expirationTime = _c === void 0 ? 0 : _c, _d = _a.waitForHighestBid, waitForHighestBid = _d === void 0 ? false : _d, englishAuctionReservePrice = _a.englishAuctionReservePrice, paymentTokenAddress = _a.paymentTokenAddress, _e = _a.extraBountyBasisPoints, extraBountyBasisPoints = _e === void 0 ? 0 : _e, buyerAddress = _a.buyerAddress, buyerEmail = _a.buyerEmail;
        return __awaiter(this, void 0, void 0, function () {
            var networkName, exchangeAddr, bal, isRegister, isApproveAssetTransfer, sellOrder;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        networkName = this.networkName;
                        exchangeAddr = this.exchange.options.address;
                        return [4 /*yield*/, utils_1.getAccountNFTsBalance(this.elementSharedAsset, accountAddress, asset.tokenId)];
                    case 1:
                        bal = _f.sent();
                        if (bal == 0) {
                            console.log('createSellOrder :elementSharedAsset balanceOf equal 0 !');
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, utils_1.registerProxy(this.exchangeProxyRegistry, accountAddress)];
                    case 2:
                        isRegister = _f.sent();
                        if (!isRegister) {
                            console.log('isRegister false');
                            return [2 /*return*/, false];
                        }
                        if (!(asset.schemaName == types_1.ElementSchemaName.ERC1155)) return [3 /*break*/, 4];
                        return [4 /*yield*/, utils_1.approveERC1155TransferProxy(this.exchangeProxyRegistry, this.elementSharedAsset, accountAddress)];
                    case 3:
                        isApproveAssetTransfer = _f.sent();
                        if (!isApproveAssetTransfer) {
                            console.log('matchOrder:isApproveAssetTransfer ');
                            return [2 /*return*/, false];
                        }
                        _f.label = 4;
                    case 4: return [4 /*yield*/, utils_1._makeSellOrder({
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
                    case 5:
                        sellOrder = _f.sent();
                        return [2 /*return*/, utils_1.hashAndValidateOrder(this.web3, this.exchangeHelper, sellOrder)];
                }
            });
        });
    };
    Orders.prototype.cancelOrder = function (_a) {
        var order = _a.order, accountAddress = _a.accountAddress;
        return __awaiter(this, void 0, void 0, function () {
            var orderParamArray, orderSigArray, cancelTx;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (order.maker.toLowerCase() != accountAddress.toLowerCase()) {
                            console.log('order.maker must be accountAddress');
                            return [2 /*return*/, false];
                        }
                        orderParamArray = utils_1.orderParamsEncode(order);
                        orderSigArray = utils_1.orderSigEncode(order);
                        return [4 /*yield*/, this.exchange.methods
                                .cancelOrder(orderParamArray, orderSigArray)
                                .send({
                                from: order.maker,
                                gas: (80e4).toString()
                            })
                                .catch(function (error) {
                                console.error(error.receipt); //, error.message
                            })];
                    case 1:
                        cancelTx = _b.sent();
                        return [2 /*return*/, cancelTx.status];
                }
            });
        });
    };
    return Orders;
}(contracts_1.Contracts));
exports.Orders = Orders;
