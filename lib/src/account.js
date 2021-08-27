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
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
var contracts_1 = require("./contracts");
var approve_1 = require("./utils/approve");
var types_1 = require("./types");
var ethApi_1 = require("./api/ethApi");
var schema_1 = require("./schema");
var constants_1 = require("./utils/constants");
var schemas_1 = require("./schema/schemas");
// 根据 DB签名过的订单 make一个对手单
var Account = /** @class */ (function (_super) {
    __extends(Account, _super);
    function Account(web3, apiConfig) {
        if (apiConfig === void 0) { apiConfig = { networkName: types_1.Network.Rinkeby }; }
        var _a;
        var _this = _super.call(this, web3, apiConfig) || this;
        _this.elementAccount = apiConfig.account || ((_a = web3.eth.defaultAccount) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
        _this.ethApi = new ethApi_1.EthApi(web3.givenProvider);
        return _this;
    }
    Account.prototype.getProxy = function () {
        return __awaiter(this, void 0, void 0, function () {
            var account, to, accountApprove, data, callData;
            return __generator(this, function (_a) {
                account = this.elementAccount;
                to = this.contractsAddr.ElementixProxyRegistry;
                accountApprove = schemas_1.common.ElementSchemas.functions.isApprove({ account: account });
                data = schema_1.encodeCall(accountApprove, [this.elementAccount]);
                callData = { to: to, data: data };
                return [2 /*return*/, this.web3.eth.call(callData)];
            });
        });
    };
    Account.prototype.registerProxy = function () {
        return __awaiter(this, void 0, void 0, function () {
            var from, to, accountApprove, data, gas, gasPrice, nonce, transactionObject;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        from = this.elementAccount;
                        to = this.contractsAddr.ElementixProxyRegistry;
                        accountApprove = schemas_1.common.ElementSchemas.functions.approve();
                        data = schema_1.encodeCall(accountApprove, []);
                        return [4 /*yield*/, this.web3.eth.estimateGas({ to: to, data: data })];
                    case 1:
                        gas = _a.sent();
                        return [4 /*yield*/, this.web3.eth.getGasPrice()];
                    case 2:
                        gasPrice = _a.sent();
                        return [4 /*yield*/, this.web3.eth.getTransactionCount(from)];
                    case 3:
                        nonce = _a.sent();
                        transactionObject = {
                            from: from,
                            to: to,
                            value: 0,
                            nonce: nonce,
                            gas: gas,
                            gasPrice: gasPrice,
                            data: data
                        };
                        return [2 /*return*/, this.web3.eth.sendTransaction(transactionObject)];
                }
            });
        });
    };
    Account.prototype.checkTokenTransferProxy = function (tokenAddr) {
        return __awaiter(this, void 0, void 0, function () {
            var account, to, accountApprove, data, proxy, callData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getProxy()];
                    case 1:
                        account = _a.sent();
                        return [4 /*yield*/, this.exchange.methods.tokenTransferProxy().call()
                            // const tokenTransferProxyAddr =
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                        ];
                    case 2:
                        to = _a.sent();
                        accountApprove = schemas_1.common.ERC20Schema.functions.isApprove({ account: account }, to);
                        data = schema_1.encodeParamsCall(accountApprove);
                        return [4 /*yield*/, this.erc20.methods.allowance(account, to).encodeABI()];
                    case 3:
                        proxy = _a.sent();
                        console.log(data);
                        console.log(proxy);
                        callData = { to: to, data: data };
                        return [2 /*return*/, this.web3.eth.call(callData)];
                }
            });
        });
    };
    Account.prototype.getTokenBalances = function (tokenAddr) {
        return __awaiter(this, void 0, void 0, function () {
            var account, to, erc20Contract, accountBal, data, proxy, callData, res, params;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        account = this.elementAccount;
                        to = tokenAddr;
                        erc20Contract = this.erc20.clone();
                        accountBal = schemas_1.common.ERC20Schema.functions.countOf({ account: account });
                        data = schema_1.encodeParamsCall(accountBal);
                        return [4 /*yield*/, this.erc20.methods.balanceOf(account).encodeABI()];
                    case 1:
                        proxy = _a.sent();
                        console.log(data);
                        console.log(proxy);
                        callData = { to: to, data: data };
                        return [4 /*yield*/, this.web3.eth.call(callData)];
                    case 2:
                        res = _a.sent();
                        params = this.web3.eth.abi.decodeParameters(accountBal === null || accountBal === void 0 ? void 0 : accountBal.outputs, res);
                        // const decode = decodeCall(accountBal, res).toNumber()
                        // erc20Contract.options.address = tokenAddr
                        // const decode = await erc20Contract.methods.balanceOf(account).call()
                        // console.log(params)
                        // console.log(decode)
                        // const balance = decodeCall(accountBal, res)[0]
                        console.log(params);
                        return [2 /*return*/, params.balance];
                }
            });
        });
    };
    Account.prototype.approveTokenTransferProxy = function (tokenAddr) {
        return __awaiter(this, void 0, void 0, function () {
            var from, proxyAccount, to, accountApprove, data, proxy, gas, gasPrice, nonce, transactionObject;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        from = this.elementAccount;
                        return [4 /*yield*/, this.getProxy()];
                    case 1:
                        proxyAccount = _a.sent();
                        to = tokenAddr;
                        accountApprove = schemas_1.common.ERC20Schema.functions.approve();
                        data = schema_1.encodeCall(accountApprove, [proxyAccount, constants_1.MAX_UINT_256.toString()]);
                        return [4 /*yield*/, this.erc20.methods.approve(proxyAccount, constants_1.MAX_UINT_256.toString()).encodeABI()
                            // console.log(data)
                            // console.log(proxy)
                        ];
                    case 2:
                        proxy = _a.sent();
                        return [4 /*yield*/, this.web3.eth.estimateGas({ to: to, data: data })];
                    case 3:
                        gas = _a.sent();
                        return [4 /*yield*/, this.web3.eth.getGasPrice()];
                    case 4:
                        gasPrice = _a.sent();
                        return [4 /*yield*/, this.web3.eth.getTransactionCount(from)];
                    case 5:
                        nonce = _a.sent();
                        transactionObject = {
                            from: from,
                            to: to,
                            value: 0,
                            nonce: nonce,
                            gas: gas,
                            gasPrice: gasPrice,
                            data: data
                        };
                        return [2 /*return*/, this.web3.eth.sendTransaction(transactionObject)];
                }
            });
        });
    };
    Account.prototype.initApprove = function (error) {
        return __awaiter(this, void 0, void 0, function () {
            var erc20Contract, erc1155Contract, erc721Contract, account, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log('orderErrorHandler', error);
                        erc20Contract = this.erc20.clone();
                        erc1155Contract = this.erc1155.clone();
                        erc721Contract = this.erc721.clone();
                        account = this.web3.eth.defaultAccount;
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
                    case 3:
                        erc20Contract.options.address = error.data.erc20Address;
                        return [4 /*yield*/, approve_1.approveTokenTransferProxy({
                                exchangeContract: this.exchange,
                                erc20Contract: erc20Contract,
                                account: account
                            })];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 12];
                    case 5:
                        erc1155Contract.options.address = error.data.nftAddress;
                        return [4 /*yield*/, approve_1.approveERC1155TransferProxy({
                                proxyRegistryContract: this.exchangeProxyRegistry,
                                erc1155Contract: erc1155Contract,
                                account: account
                            })];
                    case 6:
                        _b.sent();
                        return [3 /*break*/, 12];
                    case 7:
                        erc721Contract.options.address = error.data.nftAddress;
                        return [4 /*yield*/, approve_1.approveERC721TransferProxy({
                                proxyRegistryContract: this.exchangeProxyRegistry,
                                erc721Contract: erc721Contract,
                                account: account,
                                tokenId: error.data.tokenId
                            })];
                    case 8:
                        _b.sent();
                        return [3 /*break*/, 12];
                    case 9: return [4 /*yield*/, approve_1.approveSchemaProxy({
                            contract: this,
                            orderMetadata: error.data.order.metadata
                        })];
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
}(contracts_1.Contracts));
exports.Account = Account;
