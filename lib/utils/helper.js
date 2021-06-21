"use strict";
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
exports.orderSigEncode = exports.orderParamsEncode = exports.hashOrder = exports.getSchemaList = exports.getTokenIDOwner = exports.getAccountNFTsBalance = exports.getAccountBalance = exports.makeBigNumber = exports.toBaseUnitAmount = void 0;
var constants_1 = require("./constants");
var index_1 = require("../index");
function toBaseUnitAmount(amount, decimals) {
    var unit = new constants_1.BigNumber(10).pow(decimals);
    return amount.times(unit).integerValue();
}
exports.toBaseUnitAmount = toBaseUnitAmount;
function makeBigNumber(arg) {
    // Zero sometimes returned as 0x from contracts
    if (arg === '0x') {
        arg = 0;
    }
    // fix "new BigNumber() number type has more than 15 significant digits"
    arg = arg.toString();
    return new constants_1.BigNumber(arg);
}
exports.makeBigNumber = makeBigNumber;
function getAccountBalance(web3, account, erc20) {
    return __awaiter(this, void 0, void 0, function () {
        var ethBal, erc20Bal;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, web3.eth.getBalance(account)];
                case 1:
                    ethBal = _a.sent();
                    erc20Bal = 0;
                    if (!erc20) return [3 /*break*/, 3];
                    return [4 /*yield*/, erc20.methods.balanceOf(account).call()];
                case 2:
                    erc20Bal = _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/, { ethBal: Number(ethBal), erc20Bal: Number(erc20Bal) }];
            }
        });
    });
}
exports.getAccountBalance = getAccountBalance;
function getAccountNFTsBalance(nftsContract, account, tokenId) {
    return __awaiter(this, void 0, void 0, function () {
        var bal;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, nftsContract.methods.balanceOf(account, tokenId).call()];
                case 1:
                    bal = _a.sent();
                    return [2 /*return*/, Number(bal)];
            }
        });
    });
}
exports.getAccountNFTsBalance = getAccountNFTsBalance;
function getTokenIDOwner(elementAssetContract, tokenId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // token id 的 creator
            // let exists = await elementAssetContract.methods.exists(tokenId).call()
            return [2 /*return*/, elementAssetContract.methods.creator(tokenId).call()];
        });
    });
}
exports.getTokenIDOwner = getTokenIDOwner;
// export function getTokenList(network: Network, symbol?: string): Array<any> {
//   const payTokens = tokens[network]
//   if (symbol) {
//     return [payTokens.canonicalWrappedEther, ...payTokens.otherTokens].filter((x: any) => x.symbol === symbol)
//   } else {
//     return [payTokens.canonicalWrappedEther, ...payTokens.otherTokens]
//   }
// }
function getSchemaList(network, schemaName) {
    // @ts-ignore
    var schemaList = index_1.schemas[network];
    if (!schemaList) {
        throw new Error("Trading for this Network (" + network + ") is not yet supported. Please contact us or check back later!");
    }
    if (schemaName) {
        schemaList = schemaList.filter(function (val) { return val.name === schemaName; });
    }
    return schemaList;
}
exports.getSchemaList = getSchemaList;
function hashOrder(web3, order) {
    return web3.utils
        .soliditySha3({ type: 'address', value: order.exchange }, { type: 'address', value: order.maker }, { type: 'address', value: order.taker }, { type: 'uint', value: order.makerRelayerFee }, { type: 'uint', value: order.takerRelayerFee }, { type: 'uint', value: order.takerProtocolFee }, { type: 'uint', value: order.takerProtocolFee }, { type: 'address', value: order.feeRecipient }, { type: 'uint8', value: order.feeMethod }, { type: 'uint8', value: order.side }, { type: 'uint8', value: order.saleKind }, { type: 'address', value: order.target }, { type: 'uint8', value: order.howToCall }, { type: 'bytes', value: order.dataToCall }, { type: 'bytes', value: order.replacementPattern }, { type: 'address', value: order.staticTarget }, { type: 'bytes', value: order.staticExtradata }, { type: 'address', value: order.paymentToken }, { type: 'uint', value: order.basePrice }, { type: 'uint', value: order.extra }, { type: 'uint', value: order.listingTime }, { type: 'uint', value: order.expirationTime }, { type: 'uint', value: order.salt })
        .toString('hex');
}
exports.hashOrder = hashOrder;
function orderParamsEncode(order) {
    var orderParamKeys = [
        'exchange',
        'maker',
        'taker',
        'makerRelayerFee',
        'takerRelayerFee',
        'makerProtocolFee',
        'takerProtocolFee',
        'feeRecipient',
        'feeMethod',
        'side',
        'saleKind',
        'target',
        'howToCall',
        'dataToCall',
        'replacementPattern',
        'staticTarget',
        'staticExtradata',
        'paymentToken',
        'basePrice',
        'extra',
        'listingTime',
        'expirationTime',
        'salt'
    ];
    var orerParamValueArray = [];
    for (var _i = 0, orderParamKeys_1 = orderParamKeys; _i < orderParamKeys_1.length; _i++) {
        var key = orderParamKeys_1[_i];
        // @ts-ignore
        var val = order[key];
        if (val === undefined) {
            console.log('orderParamsEncode key undefined', key);
            continue;
        }
        if (constants_1.BigNumber.isBigNumber(val)) {
            val = val.toString();
        }
        orerParamValueArray.push(val);
    }
    return orerParamValueArray;
}
exports.orderParamsEncode = orderParamsEncode;
function orderSigEncode(order) {
    var orderSigKeys = ['v', 'r', 's'];
    var orderSigValueArray = [];
    for (var _i = 0, orderSigKeys_1 = orderSigKeys; _i < orderSigKeys_1.length; _i++) {
        var key = orderSigKeys_1[_i];
        // @ts-ignore
        if (order[key] === undefined) {
            console.log('orderSigEncode key undefined', key);
            continue;
        }
        // @ts-ignore
        orderSigValueArray.push(order[key]);
    }
    return orderSigValueArray;
}
exports.orderSigEncode = orderSigEncode;