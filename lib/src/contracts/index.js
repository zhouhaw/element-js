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
exports.ContractSchemas = void 0;
var events_1 = require("events");
var config_1 = require("./config");
var types_1 = require("../types");
var tokens_1 = require("../schema/tokens");
var schemas_1 = require("../schema/schemas");
var ContractSchemas = /** @class */ (function (_super) {
    __extends(ContractSchemas, _super);
    function ContractSchemas(web3, apiConfig) {
        if (apiConfig === void 0) { apiConfig = { networkName: types_1.Network.Rinkeby }; }
        var _this = _super.call(this) || this;
        _this.ETH = {
            name: 'etherem',
            symbol: 'ETH',
            address: config_1.NULL_ADDRESS,
            decimals: 18
        };
        var networkName = apiConfig.networkName, paymentTokens = apiConfig.paymentTokens;
        _this.paymentTokenList = paymentTokens || tokens_1.tokens[networkName].otherTokens;
        _this.networkName = networkName;
        var contracts = config_1.CONTRACTS_ADDRESSES[networkName];
        var exchangeHelperAddr = contracts.ExchangeHelper.toLowerCase();
        var exchangeAddr = contracts.ElementixExchange.toLowerCase();
        var proxyRegistryAddr = contracts.ElementixProxyRegistry.toLowerCase();
        var elementSharedAssetAddr = contracts.ElementSharedAsset.toLowerCase();
        var elementixExchangeKeeperAddr = contracts.ElementixExchangeKeeper.toLowerCase();
        var feeRecipientAddress = contracts.FeeRecipientAddress.toLowerCase();
        var tokenTransferProxyAddr = contracts.ElementixTokenTransferProxy.toLowerCase();
        var wethAddr = contracts.WETH.toLowerCase();
        _this.contractsAddr = contracts;
        _this.WETHAddr = wethAddr;
        _this.WETHToekn = {
            name: 'WETH9',
            symbol: 'WETH',
            address: wethAddr,
            decimals: 18
        };
        _this.elementSharedAssetAddr = elementSharedAssetAddr;
        _this.elementixExchangeKeeperAddr = elementixExchangeKeeperAddr;
        _this.feeRecipientAddress = feeRecipientAddress;
        if (exchangeHelperAddr && exchangeAddr && proxyRegistryAddr) {
            _this.web3 = web3;
            _this.elementixProxyRegistry = proxyRegistryAddr;
            _this.elementixExchange = exchangeAddr;
            // await this.exchange.methods.tokenTransferProxy().call()
            _this.elementixTokenTransferProxy = tokenTransferProxyAddr;
            _this.Erc20Func = schemas_1.common.ERC20Schema.functions;
            _this.ElementRegistryFunc = schemas_1.common.ElementRegistrySchemas.functions;
            _this.ElementExchangeFunc = schemas_1.common.ElementRegistrySchemas.functions;
        }
        else {
            throw new Error(_this.networkName + "  abi undefined");
        }
        return _this;
    }
    ContractSchemas.prototype.ethCall = function (callData, outputs) {
        return __awaiter(this, void 0, void 0, function () {
            var hexStr, params;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.web3.eth.call(callData)];
                    case 1:
                        hexStr = _a.sent();
                        params = this.web3.eth.abi.decodeParameters(outputs, hexStr);
                        if (params.__length__ == 1) {
                            return [2 /*return*/, params[0]];
                        }
                        return [2 /*return*/, params];
                }
            });
        });
    };
    //发送标准交易
    ContractSchemas.prototype.ethSend = function (callData, from) {
        return __awaiter(this, void 0, void 0, function () {
            var gas, gasPrice, nonce, transactionObject;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.web3.eth.estimateGas(callData)];
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
                            to: callData.to,
                            value: callData.value || 0,
                            nonce: nonce,
                            gas: gas,
                            gasPrice: gasPrice,
                            data: callData.data
                        };
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                var sendTx = _this.web3.eth.sendTransaction(transactionObject).once('transactionHash', function (txHash) {
                                    resolve({ sendTx: sendTx, txHash: txHash });
                                });
                            })
                            // .on('receipt', (receipt: any) => {
                            //   // console.log('approveTokenTransferProxy tx receipt', receipt)
                            //   this.emit('receipt', receipt)
                            // })
                            // .catch((error: any) => {
                            //   this.emit('error', error)
                            // })
                        ];
                }
            });
        });
    };
    return ContractSchemas;
}(events_1.EventEmitter));
exports.ContractSchemas = ContractSchemas;
