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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferFromERC1155 = exports.getSchemaList = exports.getTokenList = exports.estimateCurrentPrice = exports.orderFromJSON = exports.orderToJSON = exports.signOrderHash = exports.validateAndFormatWalletAddress = exports.hashOrder = exports.orderCanMatch = exports.validateOrder = exports.getOrderHash = exports.orderSigEncode = exports.orderParamsEncode = exports.MAX_UINT_256 = exports.MAX_DIGITS_IN_UNSIGNED_256_INT = exports.NULL_ADDRESS = exports._makeSellOrder = exports._makeBuyOrder = exports.checkSenderOfAuthenticatedProxy = exports.approveERC1155TransferProxy = exports.approveTokenTransferProxy = exports.getAccountNFTsBalance = exports.getAccountBalance = exports.registerProxy = exports.encodeSell = exports.encodeBuy = exports.schemas = void 0;
var bignumber_js_1 = __importDefault(require("bignumber.js"));
bignumber_js_1.default.config({ EXPONENTIAL_AT: 1e9 });
var types_1 = require("../types");
var schema_1 = require("../schema");
Object.defineProperty(exports, "schemas", { enumerable: true, get: function () { return schema_1.schemas; } });
Object.defineProperty(exports, "encodeBuy", { enumerable: true, get: function () { return schema_1.encodeBuy; } });
Object.defineProperty(exports, "encodeSell", { enumerable: true, get: function () { return schema_1.encodeSell; } });
var check_1 = require("./check");
Object.defineProperty(exports, "registerProxy", { enumerable: true, get: function () { return check_1.registerProxy; } });
Object.defineProperty(exports, "getAccountBalance", { enumerable: true, get: function () { return check_1.getAccountBalance; } });
Object.defineProperty(exports, "getAccountNFTsBalance", { enumerable: true, get: function () { return check_1.getAccountNFTsBalance; } });
Object.defineProperty(exports, "approveTokenTransferProxy", { enumerable: true, get: function () { return check_1.approveTokenTransferProxy; } });
Object.defineProperty(exports, "approveERC1155TransferProxy", { enumerable: true, get: function () { return check_1.approveERC1155TransferProxy; } });
Object.defineProperty(exports, "checkSenderOfAuthenticatedProxy", { enumerable: true, get: function () { return check_1.checkSenderOfAuthenticatedProxy; } });
var order_1 = require("./order");
Object.defineProperty(exports, "_makeBuyOrder", { enumerable: true, get: function () { return order_1._makeBuyOrder; } });
Object.defineProperty(exports, "_makeSellOrder", { enumerable: true, get: function () { return order_1._makeSellOrder; } });
exports.NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
exports.MAX_DIGITS_IN_UNSIGNED_256_INT = 78; // 78 solt
exports.MAX_UINT_256 = new bignumber_js_1.default(2).pow(256).minus(1); // approve
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
        var val = order[key];
        if (bignumber_js_1.default.isBigNumber(val)) {
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
        orderSigValueArray.push(order[key]);
    }
    return orderSigValueArray;
}
exports.orderSigEncode = orderSigEncode;
function getOrderHash(web3, exchangeHelper, order) {
    return __awaiter(this, void 0, void 0, function () {
        var orderParamValueArray, hash;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    orderParamValueArray = orderParamsEncode(order);
                    return [4 /*yield*/, exchangeHelper.methods.hashOrder(orderParamValueArray).call()
                        // let messageHash = web3.eth.accounts.hashMessage(hash)
                    ];
                case 1:
                    hash = _a.sent();
                    // let messageHash = web3.eth.accounts.hashMessage(hash)
                    return [2 /*return*/, hash];
            }
        });
    });
}
exports.getOrderHash = getOrderHash;
function validateOrder(exchangeHelper, order) {
    return __awaiter(this, void 0, void 0, function () {
        var orderParamValueArray, orderSigArray;
        return __generator(this, function (_a) {
            orderParamValueArray = orderParamsEncode(order);
            orderSigArray = orderSigEncode(order);
            return [2 /*return*/, exchangeHelper.methods.validateOrder(orderParamValueArray, orderSigArray).call()];
        });
    });
}
exports.validateOrder = validateOrder;
var canSettleOrder = function (listingTime, expirationTime) {
    var now = new Date().getTime() / 1000;
    return listingTime.toNumber() < now && (expirationTime.toNumber() == 0 || now < expirationTime.toNumber());
};
function orderCanMatch(buy, sell) {
    return (buy.side == 0 &&
        sell.side == 1 &&
        /* Must use same fee method. */
        buy.feeMethod == sell.feeMethod &&
        /* Must use same payment token. */
        buy.paymentToken == sell.paymentToken &&
        /* Must match maker/taker addresses. */
        (sell.taker == exports.NULL_ADDRESS || sell.taker == buy.maker) &&
        (buy.taker == exports.NULL_ADDRESS || buy.taker == sell.maker) &&
        /* One must be maker and the other must be taker (no bool XOR in Solidity). */
        ((sell.feeRecipient == exports.NULL_ADDRESS && buy.feeRecipient != exports.NULL_ADDRESS) ||
            (sell.feeRecipient != exports.NULL_ADDRESS && buy.feeRecipient == exports.NULL_ADDRESS)) &&
        /* Must match target. */
        buy.target == sell.target &&
        /* Must match howToCall. */
        buy.howToCall == sell.howToCall &&
        /* Buy-side order must be settleable. */
        canSettleOrder(buy.listingTime, buy.expirationTime) &&
        /* Sell-side order must be settleable. */
        canSettleOrder(sell.listingTime, sell.expirationTime));
}
exports.orderCanMatch = orderCanMatch;
function hashOrder(web3, order) {
    return web3.utils
        .soliditySha3({ type: 'address', value: order.exchange }, { type: 'address', value: order.maker }, { type: 'address', value: order.taker }, { type: 'uint', value: new bignumber_js_1.default(order.makerRelayerFee) }, { type: 'uint', value: new bignumber_js_1.default(order.takerRelayerFee) }, { type: 'uint', value: new bignumber_js_1.default(order.takerProtocolFee) }, { type: 'uint', value: new bignumber_js_1.default(order.takerProtocolFee) }, { type: 'address', value: order.feeRecipient }, { type: 'uint8', value: order.feeMethod }, { type: 'uint8', value: order.side }, { type: 'uint8', value: order.saleKind }, { type: 'address', value: order.target }, { type: 'uint8', value: order.howToCall }, { type: 'bytes', value: order.dataToCall }, { type: 'bytes', value: order.replacementPattern }, { type: 'address', value: order.staticTarget }, { type: 'bytes', value: order.staticExtradata }, { type: 'address', value: order.paymentToken }, { type: 'uint', value: new bignumber_js_1.default(order.basePrice) }, { type: 'uint', value: new bignumber_js_1.default(order.extra) }, { type: 'uint', value: new bignumber_js_1.default(order.listingTime) }, { type: 'uint', value: new bignumber_js_1.default(order.expirationTime) }, { type: 'uint', value: order.salt })
        .toString('hex');
}
exports.hashOrder = hashOrder;
function validateAndFormatWalletAddress(web3, address) {
    if (!address) {
        throw new Error('No wallet address found');
    }
    if (!web3.utils.isAddress(address)) {
        throw new Error('Invalid wallet address');
    }
    if (address === exports.NULL_ADDRESS) {
        throw new Error('Wallet cannot be the null address');
    }
    return address.toLowerCase();
}
exports.validateAndFormatWalletAddress = validateAndFormatWalletAddress;
function signOrderHash(web3, hashedOrder) {
    return __awaiter(this, void 0, void 0, function () {
        var signature, signatureRes, signatureHex, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    signatureRes = void 0;
                    if (!(typeof window !== 'undefined')) return [3 /*break*/, 2];
                    return [4 /*yield*/, web3.eth.personal.sign(hashedOrder.hash, hashedOrder.maker)];
                case 1:
                    signatureRes = _a.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, web3.eth.sign(hashedOrder.hash, hashedOrder.maker)];
                case 3:
                    signatureRes = _a.sent();
                    _a.label = 4;
                case 4:
                    signatureHex = signatureRes.slice(2);
                    signature = {
                        v: Number.parseInt(signatureHex.slice(128, 130), 16),
                        r: "0x" + signatureHex.slice(0, 64),
                        s: "0x" + signatureHex.slice(64, 128)
                    };
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _a.sent();
                    console.error(error_1);
                    throw new Error('You declined to authorize your auction');
                case 6: return [2 /*return*/, signature];
            }
        });
    });
}
exports.signOrderHash = signOrderHash;
var orderToJSON = function (order) {
    var asJSON = {
        exchange: order.exchange.toLowerCase(),
        maker: order.maker.toLowerCase(),
        taker: order.taker.toLowerCase(),
        makerRelayerFee: order.makerRelayerFee.toString(),
        takerRelayerFee: order.takerRelayerFee.toString(),
        makerProtocolFee: order.makerProtocolFee.toString(),
        takerProtocolFee: order.takerProtocolFee.toString(),
        makerReferrerFee: order.makerReferrerFee.toString(),
        feeMethod: order.feeMethod,
        feeRecipient: order.feeRecipient.toLowerCase(),
        side: order.side,
        saleKind: order.saleKind,
        target: order.target.toLowerCase(),
        howToCall: order.howToCall,
        dataToCall: order.dataToCall,
        replacementPattern: order.replacementPattern,
        staticTarget: order.staticTarget.toLowerCase(),
        staticExtradata: order.staticExtradata,
        paymentToken: order.paymentToken.toLowerCase(),
        quantity: order.quantity.toString(),
        basePrice: order.basePrice.toString(),
        extra: order.extra.toString(),
        listingTime: order.listingTime.toString(),
        expirationTime: order.expirationTime.toString(),
        salt: order.salt.toString(),
        metadata: order.metadata,
        v: order.v,
        r: order.r,
        s: order.s,
        hash: order.hash
    };
    return asJSON;
};
exports.orderToJSON = orderToJSON;
var orderFromJSON = function (order) {
    var createdDate = new Date(); // `${order.created_date}Z`
    var fromJSON = {
        hash: order.hash,
        cancelledOrFinalized: order.cancelled || order.finalized,
        markedInvalid: order.marked_invalid,
        metadata: order.metadata,
        quantity: new bignumber_js_1.default(order.quantity || 1),
        exchange: order.exchange,
        makerAccount: order.maker,
        takerAccount: order.taker,
        // Use string address to conform to Element Order schema
        maker: order.maker,
        taker: order.taker,
        makerRelayerFee: new bignumber_js_1.default(order.makerRelayerFee),
        takerRelayerFee: new bignumber_js_1.default(order.takerRelayerFee),
        makerProtocolFee: new bignumber_js_1.default(order.makerProtocolFee),
        takerProtocolFee: new bignumber_js_1.default(order.takerProtocolFee),
        makerReferrerFee: new bignumber_js_1.default(order.makerReferrerFee || 0),
        waitingForBestCounterOrder: order.feeRecipient == exports.NULL_ADDRESS,
        feeMethod: order.feeMethod,
        feeRecipientAccount: order.feeRecipient,
        feeRecipient: order.feeRecipient,
        side: order.side,
        saleKind: order.saleKind,
        target: order.target,
        howToCall: order.howToCall,
        dataToCall: order.dataToCall,
        replacementPattern: order.replacementPattern,
        staticTarget: order.staticTarget,
        staticExtradata: order.staticExtradata,
        paymentToken: order.paymentToken,
        basePrice: new bignumber_js_1.default(order.basePrice),
        extra: new bignumber_js_1.default(order.extra),
        currentBounty: new bignumber_js_1.default(order.currentBounty || 0),
        currentPrice: new bignumber_js_1.default(order.currentPrice || 0),
        createdTime: new bignumber_js_1.default(Math.round(createdDate.getTime() / 1000)),
        listingTime: new bignumber_js_1.default(order.listingTime),
        expirationTime: new bignumber_js_1.default(order.expirationTime),
        salt: new bignumber_js_1.default(order.salt),
        v: Number.parseInt(order.v),
        r: order.r,
        s: order.s,
        paymentTokenContract: order.paymentToken || undefined,
        asset: order.asset || undefined,
        assetBundle: order.assetBundle || undefined
    };
    // Use client-side price calc, to account for buyer fee (not added by server) and latency
    fromJSON.currentPrice = estimateCurrentPrice(fromJSON);
    return fromJSON;
};
exports.orderFromJSON = orderFromJSON;
var INVERSE_BASIS_POINT = 10000;
function estimateCurrentPrice(order, secondsToBacktrack, shouldRoundUp) {
    if (secondsToBacktrack === void 0) { secondsToBacktrack = 30; }
    if (shouldRoundUp === void 0) { shouldRoundUp = true; }
    var basePrice = order.basePrice, listingTime = order.listingTime, expirationTime = order.expirationTime, extra = order.extra;
    var side = order.side, takerRelayerFee = order.takerRelayerFee, saleKind = order.saleKind;
    var now = new bignumber_js_1.default(Math.round(Date.now() / 1000)).minus(secondsToBacktrack);
    basePrice = new bignumber_js_1.default(basePrice);
    listingTime = new bignumber_js_1.default(listingTime);
    expirationTime = new bignumber_js_1.default(expirationTime);
    extra = new bignumber_js_1.default(extra);
    var exactPrice = basePrice;
    if (saleKind === types_1.SaleKind.FixedPrice) {
        // Do nothing, price is correct
    }
    else if (saleKind === types_1.SaleKind.DutchAuction) {
        var diff = extra.times(now.minus(listingTime)).dividedBy(expirationTime.minus(listingTime));
        exactPrice =
            side === types_1.OrderSide.Sell
                ? /* Sell-side - start price: basePrice. End price: basePrice - extra. */
                    basePrice.minus(diff)
                : /* Buy-side - start price: basePrice. End price: basePrice + extra. */
                    basePrice.plus(diff);
    }
    // Add taker fee only for buyers
    if (side === types_1.OrderSide.Sell && !order.waitingForBestCounterOrder) {
        // Buyer fee increases sale price
        exactPrice = exactPrice.times(+takerRelayerFee / INVERSE_BASIS_POINT + 1);
    }
    return shouldRoundUp ? exactPrice.abs() : exactPrice;
}
exports.estimateCurrentPrice = estimateCurrentPrice;
function getTokenList(network, symbol) {
    var payTokens = schema_1.tokens[network];
    if (symbol) {
        return __spreadArray([payTokens.canonicalWrappedEther], payTokens.otherTokens).filter(function (x) { return x.symbol === symbol; });
    }
    else {
        return __spreadArray([payTokens.canonicalWrappedEther], payTokens.otherTokens);
    }
}
exports.getTokenList = getTokenList;
function getSchemaList(network, schemaName) {
    // @ts-ignore
    var schemaList = schema_1.schemas[network];
    if (schemaName) {
        schemaList = schemaList.filter(function (x) { return x.name === schemaName; });
    }
    return schemaList;
}
exports.getSchemaList = getSchemaList;
function transferFromERC1155(nftsContract, from, to, tokenId, amount) {
    if (amount === void 0) { amount = 1; }
    return __awaiter(this, void 0, void 0, function () {
        var tx;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, nftsContract.methods.safeTransferFrom(from, to, tokenId, amount, '0x').send({ from: from })];
                case 1:
                    tx = _a.sent();
                    return [2 /*return*/, tx.status];
            }
        });
    });
}
exports.transferFromERC1155 = transferFromERC1155;
