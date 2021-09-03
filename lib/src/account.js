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
exports.Account = void 0;
var error_1 = require("./base/error");
var index_1 = require("./contracts/index");
var types_1 = require("./types");
var schema_1 = require("./schema");
var constants_1 = require("./utils/constants");
var helper_1 = require("./utils/helper");
// 根据 DB签名过的订单 make一个对手单
var Account = /** @class */ (function (_super) {
    __extends(Account, _super);
    function Account(web3, apiConfig) {
        if (apiConfig === void 0) { apiConfig = { networkName: types_1.Network.Rinkeby }; }
        var _a;
        var _this = _super.call(this, web3, apiConfig) || this;
        _this.accountProxy = constants_1.NULL_ADDRESS;
        _this.elementAccount = apiConfig.account || ((_a = web3.eth.defaultAccount) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
        // this.ethApi = new EthApi(web3.currentProvider.host)
        _this.accountProxy = constants_1.NULL_ADDRESS;
        return _this;
    }
    Account.prototype.getOrderApprove = function (order) {
        return __awaiter(this, void 0, void 0, function () {
            var metadata, sell, proxy, _a, allowance, buy, allowance;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        metadata = order.metadata;
                        if (!(order.side == types_1.OrderSide.Sell)) return [3 /*break*/, 6];
                        sell = {
                            paymentTokenApprove: {
                                isApprove: false,
                                func: this.approveTokenTransferProxy
                            },
                            accountRegister: {
                                isApprove: false,
                                func: this.registerProxy
                            },
                            sellAssetApprove: {
                                isApprove: false,
                                func: this.approveAssetTransferProxy
                            }
                        };
                        return [4 /*yield*/, this.getAccountProxy()];
                    case 1:
                        proxy = _b.sent();
                        if (proxy !== constants_1.NULL_ADDRESS) {
                            sell.accountRegister.isApprove = true;
                        }
                        _a = sell.sellAssetApprove;
                        return [4 /*yield*/, this.checkAssetTransferProxy(metadata)];
                    case 2:
                        _a.isApprove = _b.sent();
                        if (!(order.paymentToken !== constants_1.NULL_ADDRESS)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.checkTokenTransferProxy(order.paymentToken)];
                    case 3:
                        allowance = _b.sent();
                        sell.paymentTokenApprove.isApprove = new constants_1.BigNumber(allowance).gte(allowance);
                        return [3 /*break*/, 5];
                    case 4:
                        sell.paymentTokenApprove.isApprove = true;
                        _b.label = 5;
                    case 5: return [2 /*return*/, sell];
                    case 6:
                        buy = {
                            paymentTokenApprove: {
                                isApprove: false,
                                func: this.approveTokenTransferProxy
                            }
                        };
                        if (!(order.paymentToken !== constants_1.NULL_ADDRESS)) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.checkTokenTransferProxy(order.paymentToken)];
                    case 7:
                        allowance = _b.sent();
                        buy.paymentTokenApprove.isApprove = new constants_1.BigNumber(allowance).gte(order.basePrice);
                        return [3 /*break*/, 9];
                    case 8: throw new error_1.ElementError({ code: '1204' });
                    case 9: return [2 /*return*/, buy];
                }
            });
        });
    };
    Account.prototype.getAccountProxy = function () {
        return __awaiter(this, void 0, void 0, function () {
            var owner, address, accountApprove, data, callData, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        owner = this.elementAccount;
                        address = this.elementixProxyRegistry;
                        if (!(this.accountProxy === constants_1.NULL_ADDRESS)) return [3 /*break*/, 2];
                        accountApprove = this.ElementRegistryFunc.accountProxy({ address: address });
                        data = schema_1.encodeParamsCall(accountApprove, { owner: owner });
                        callData = { to: accountApprove.target, data: data };
                        _a = this;
                        return [4 /*yield*/, this.ethCall(callData, accountApprove === null || accountApprove === void 0 ? void 0 : accountApprove.outputs)];
                    case 1:
                        _a.accountProxy = _b.sent();
                        _b.label = 2;
                    case 2: return [2 /*return*/, this.accountProxy];
                }
            });
        });
    };
    Account.prototype.registerProxy = function () {
        return __awaiter(this, void 0, void 0, function () {
            var address, accountApprove, data, callData;
            return __generator(this, function (_a) {
                address = this.elementixProxyRegistry;
                accountApprove = this.ElementRegistryFunc.registerProxy({ address: address });
                data = schema_1.encodeParamsCall(accountApprove, {});
                callData = { to: accountApprove.target, data: data };
                return [2 /*return*/, this.ethSend(callData, this.elementAccount)];
            });
        });
    };
    Account.prototype.checkTokenTransferProxy = function (to) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenProxy, accountApprove, data, callData;
            return __generator(this, function (_a) {
                tokenProxy = this.elementixTokenTransferProxy;
                accountApprove = this.Erc20Func.isApprove({ address: to });
                data = schema_1.encodeParamsCall(accountApprove, { owner: this.elementAccount, replace: tokenProxy });
                callData = { to: to, data: data };
                return [2 /*return*/, this.ethCall(callData, accountApprove === null || accountApprove === void 0 ? void 0 : accountApprove.outputs)];
            });
        });
    };
    Account.prototype.getTokenBalances = function (to, account) {
        return __awaiter(this, void 0, void 0, function () {
            var owner, accountBal, data, callData;
            return __generator(this, function (_a) {
                owner = account || this.elementAccount;
                accountBal = this.Erc20Func.countOf({ address: to });
                data = schema_1.encodeParamsCall(accountBal, { owner: owner });
                callData = { to: to, data: data };
                return [2 /*return*/, this.ethCall(callData, accountBal === null || accountBal === void 0 ? void 0 : accountBal.outputs)];
            });
        });
    };
    Account.prototype.getAssetBalances = function (metadata, account) {
        return __awaiter(this, void 0, void 0, function () {
            var owner, accountBal, data, callData;
            return __generator(this, function (_a) {
                owner = account || this.elementAccount;
                accountBal = schema_1.getBalanceSchemas(metadata);
                data = schema_1.encodeParamsCall(accountBal, { owner: owner });
                callData = { to: accountBal.target, data: data };
                return [2 /*return*/, this.ethCall(callData, accountBal === null || accountBal === void 0 ? void 0 : accountBal.outputs)];
            });
        });
    };
    Account.prototype.approveTokenTransferProxy = function (to) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenProxy, quantity, accountApprove, data, callData;
            return __generator(this, function (_a) {
                tokenProxy = this.elementixTokenTransferProxy;
                quantity = constants_1.MAX_UINT_256.toString();
                accountApprove = this.Erc20Func.approve({ quantity: quantity });
                data = schema_1.encodeParamsCall(accountApprove, { replace: tokenProxy });
                callData = { to: to, data: data };
                return [2 /*return*/, this.ethSend(callData, this.elementAccount)];
            });
        });
    };
    Account.prototype.checkAssetTransferProxy = function (metadata) {
        return __awaiter(this, void 0, void 0, function () {
            var owner, operator, accountApprove, data, callData, res, isAddr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        owner = this.elementAccount;
                        operator = this.elementixTokenTransferProxy;
                        accountApprove = schema_1.getIsApproveSchemas(metadata);
                        data = schema_1.encodeParamsCall(accountApprove, { owner: owner, replace: operator });
                        callData = { to: accountApprove.target, data: data };
                        return [4 /*yield*/, this.ethCall(callData, accountApprove === null || accountApprove === void 0 ? void 0 : accountApprove.outputs)];
                    case 1:
                        res = _a.sent();
                        isAddr = accountApprove === null || accountApprove === void 0 ? void 0 : accountApprove.outputs.some(function (val) { return val.type == 'address'; });
                        if (isAddr) {
                            // 授权地址是否和 proxy一致
                            return [2 /*return*/, res.toLowerCase() === operator.toLowerCase()];
                        }
                        return [2 /*return*/, res];
                }
            });
        });
    };
    Account.prototype.approveAssetTransferProxy = function (metadata) {
        return __awaiter(this, void 0, void 0, function () {
            var operator, accountApprove, data, callData;
            return __generator(this, function (_a) {
                operator = this.elementixTokenTransferProxy;
                accountApprove = schema_1.getApproveSchemas(metadata);
                data = schema_1.encodeParamsCall(accountApprove, { owner: operator, replace: true });
                callData = { to: accountApprove.target, data: data };
                return [2 /*return*/, this.ethSend(callData, this.elementAccount)];
            });
        });
    };
    // 撮合订单
    Account.prototype.orderMatch = function (_a) {
        var buy = _a.buy, sell = _a.sell, _b = _a.metadata, metadata = _b === void 0 ? '0x' : _b;
        return __awaiter(this, void 0, void 0, function () {
            var to, sellOrderParamArray, sellOrderSigArray, buyOrderParamArray, buyOrderSigArray, accountApprove, data, value, callData;
            return __generator(this, function (_c) {
                to = this.elementixExchange;
                sellOrderParamArray = helper_1.orderParamsEncode(sell);
                sellOrderSigArray = helper_1.orderSigEncode(sell);
                buyOrderParamArray = helper_1.orderParamsEncode(buy);
                buyOrderSigArray = helper_1.orderSigEncode(buy);
                accountApprove = this.ElementExchangeFunc.orderMatch({
                    address: to
                });
                data = schema_1.encodeWeb3Call(accountApprove, [
                    buyOrderParamArray,
                    buyOrderSigArray,
                    sellOrderParamArray,
                    sellOrderSigArray,
                    metadata
                ]);
                value = buy.paymentToken !== constants_1.NULL_ADDRESS ? 0 : buy.basePrice;
                callData = { to: to, data: data, value: value };
                return [2 /*return*/, this.ethSend(callData, this.elementAccount)];
            });
        });
    };
    // 取消订单
    Account.prototype.orderCancel = function (_a) {
        var order = _a.order;
        return __awaiter(this, void 0, void 0, function () {
            var to, orderParamArray, orderSigArray, accountApprove, data, callData;
            return __generator(this, function (_b) {
                to = this.elementixExchange;
                orderParamArray = helper_1.orderParamsEncode(order);
                orderSigArray = helper_1.orderSigEncode(order);
                accountApprove = this.ElementExchangeFunc.orderCancel({
                    address: to
                });
                data = schema_1.encodeWeb3Call(accountApprove, [orderParamArray, orderSigArray]);
                callData = { to: to, data: data };
                return [2 /*return*/, this.ethSend(callData, this.elementAccount)];
            });
        });
    };
    Account.prototype.assetTransfer = function (asset, to) {
        return __awaiter(this, void 0, void 0, function () {
            var owner, accountApprove, data, callData;
            return __generator(this, function (_a) {
                owner = this.elementAccount;
                accountApprove = schema_1.getTransferSchemas(asset);
                data = schema_1.encodeParamsCall(accountApprove, { owner: owner, replace: to });
                callData = { to: accountApprove.target, data: data };
                return [2 /*return*/, this.ethSend(callData, owner)];
            });
        });
    };
    Account.prototype.accountApprove = function (error) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log('orderErrorHandler', error);
                        _a = String(error.code);
                        switch (_a) {
                            case '1001': return [3 /*break*/, 1];
                            case '1101': return [3 /*break*/, 3];
                            case '1102': return [3 /*break*/, 5];
                            case '1106': return [3 /*break*/, 7];
                            case '1108': return [3 /*break*/, 9];
                        }
                        return [3 /*break*/, 11];
                    case 1: // initialize
                    return [4 /*yield*/, this.registerProxy()];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 12];
                    case 3: // 批准任何erc20 token
                    return [4 /*yield*/, this.approveTokenTransferProxy(error.data.erc20Address)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 12];
                    case 5: // checkApproveERC1155TransferProxy
                    return [4 /*yield*/, this.approveAssetTransferProxy(error.data.order.metadata)];
                    case 6:
                        _b.sent();
                        return [3 /*break*/, 12];
                    case 7: // checkApproveERC721TransferProxy
                    return [4 /*yield*/, this.approveAssetTransferProxy(error.data.order.metadata)];
                    case 8:
                        _b.sent();
                        return [3 /*break*/, 12];
                    case 9: // CryptoKitties
                    return [4 /*yield*/, this.approveAssetTransferProxy(error.data.order.metadata)];
                    case 10:
                        _b.sent();
                        return [3 /*break*/, 12];
                    case 11:
                        console.log('orderErrorHandler error', error);
                        _b.label = 12;
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    return Account;
}(index_1.ContractSchemas));
exports.Account = Account;
