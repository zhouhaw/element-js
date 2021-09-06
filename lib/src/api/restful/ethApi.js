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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EthApi = exports.Web3 = void 0;
var web3_1 = __importDefault(require("web3"));
exports.Web3 = web3_1.default;
var base_1 = require("./base");
var EthApi = /** @class */ (function (_super) {
    __extends(EthApi, _super);
    function EthApi(providerUrl) {
        var _this = _super.call(this, providerUrl) || this;
        _this.rpcUrl = providerUrl;
        _this.web3SDK = new web3_1.default(providerUrl);
        return _this;
    }
    EthApi.prototype.getTransactionCount = function (account) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.web3SDK.eth.getTransactionCount(account)];
            });
        });
    };
    EthApi.prototype.estimateGas = function (to, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.web3SDK.eth.estimateGas({ to: to, data: data })];
            });
        });
    };
    EthApi.prototype.getGasPrice = function (type) {
        if (type === void 0) { type = 'eth'; }
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(type == 'gasnow')) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.get('https://www.gasnow.org/api/v3/gas/price')];
                    case 1:
                        res = _a.sent();
                        return [2 /*return*/, res.data.data.rapid];
                    case 2: return [2 /*return*/, Number(this.web3SDK.eth.getGasPrice())];
                }
            });
        });
    };
    EthApi.prototype.getSendTx = function (_a) {
        var from = _a.from, to = _a.to, data = _a.data, _b = _a.value, value = _b === void 0 ? 0 : _b;
        return __awaiter(this, void 0, void 0, function () {
            var gas, nonce, gasPrice;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.estimateGas(to, data)];
                    case 1:
                        gas = _c.sent();
                        return [4 /*yield*/, this.getTransactionCount(from)];
                    case 2:
                        nonce = _c.sent();
                        return [4 /*yield*/, this.getGasPrice()];
                    case 3:
                        gasPrice = _c.sent();
                        return [2 /*return*/, {
                                from: from,
                                to: to,
                                value: value,
                                gas: gas,
                                gasPrice: gasPrice,
                                nonce: nonce,
                                data: data
                            }];
                }
            });
        });
    };
    EthApi.prototype.sendTransaction = function (_a) {
        var from = _a.from, to = _a.to, data = _a.data, _b = _a.value, value = _b === void 0 ? 0 : _b;
        return __awaiter(this, void 0, void 0, function () {
            var transactionObject;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.getSendTx({ from: from, to: to, data: data, value: value })];
                    case 1:
                        transactionObject = _c.sent();
                        return [4 /*yield*/, this.web3SDK.eth.sendTransaction(transactionObject)];
                    case 2:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    EthApi.prototype.contractCall = function (to, data) {
        return __awaiter(this, void 0, void 0, function () {
            var _body;
            return __generator(this, function (_a) {
                _body = {
                    method: 'eth_call',
                    params: [
                        {
                            to: to,
                            data: data
                        },
                        'latest'
                    ]
                };
                return [2 /*return*/, fetch(this.rpcUrl, _body).catch(function (e) {
                        throw e;
                    })];
            });
        });
    };
    return EthApi;
}(base_1.Fetch));
exports.EthApi = EthApi;
// public async getCallData({schemaName,networkName}:{schemaName:ElementSchemaName,networkName:Network}) {
//
//     const schemas = getSchemaList(networkName, schemaName)
//     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//     // @ts-ignore
//     const accountApprove = schema?.functions?.approve(elementAsset, operator)
//     const callData = encodeCall(accountApprove, [operator, asset.tokenId])
// }
