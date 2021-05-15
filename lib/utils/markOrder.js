"use strict";
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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashOrder = exports.schemaEncodeSell = exports.orderToJSON = exports.signOrderHash = exports.hashAndValidateOrder = exports.getOrderHash = exports.orderSigEncode = exports.orderParamsEncode = exports.getSchemaList = exports.getTokenList = exports._makeSellOrder = exports._makeBuyOrder = exports.getTimeParameters = exports.getPriceParameters = exports.generatePseudoRandomSalt = exports.getSchemaAndAsset = exports.getElementAsset = exports.getSchema = exports.makeBigNumber = exports.toBaseUnitAmount = void 0;
var types_1 = require("../types");
// import { schemas, encodeBuy, encodeSell, encodeCall } from '../schema'
var schema_1 = require("../schema");
var tokens_1 = require("../schema/tokens");
var error_1 = require("../base/error");
var constants_1 = require("./constants");
var check_1 = require("./check");
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
function getSchema(network, schemaName) {
    var schemaName_ = schemaName || types_1.ElementSchemaName.ERC1155;
    var schemaInfo = getSchemaList(network, schemaName_); // scahmaList.find((val: Schema<any>) => val.name === schemaName_)
    if (schemaInfo.length == 0) {
        var msg = "Trading for this asset (" + schemaName_ + ") is not yet supported. Please contact us or check back later!";
        throw new error_1.ElementError({ code: 1000, message: msg });
    }
    return schemaInfo[0];
}
exports.getSchema = getSchema;
function getElementAsset(schema, asset, quantity) {
    if (quantity === void 0) { quantity = new constants_1.BigNumber(1); }
    var tokenId = asset.tokenId != undefined ? asset.tokenId.toString() : undefined;
    return schema.assetFromFields({
        ID: tokenId,
        Quantity: quantity.toString(),
        Address: asset.tokenAddress.toLowerCase(),
        Name: asset.name,
        Data: asset.data || ''
    });
}
exports.getElementAsset = getElementAsset;
function getSchemaAndAsset(networkName, asset, quantity) {
    var schema = getSchema(networkName, asset.schemaName);
    // const quantityBN = makeBigNumber(quantity) // WyvernProtocol.toBaseUnitAmount(makeBigNumber(quantity), asset.decimals || 0)
    var quantityBN = makeBigNumber(quantity);
    var elementAsset = getElementAsset(schema, asset, quantityBN);
    return {
        schema: schema,
        elementAsset: elementAsset,
        quantityBN: quantityBN
    };
}
exports.getSchemaAndAsset = getSchemaAndAsset;
function generatePseudoRandomSalt() {
    // BigNumber.random returns a pseudo-random number between 0 & 1 with a passed in number of decimal places.
    // Source: https://mikemcl.github.io/bignumber.js/#random
    var randomNumber = constants_1.BigNumber.random(constants_1.MAX_DIGITS_IN_UNSIGNED_256_INT);
    var factor = new constants_1.BigNumber(10).pow(constants_1.MAX_DIGITS_IN_UNSIGNED_256_INT - 1);
    return randomNumber.times(factor).integerValue();
}
exports.generatePseudoRandomSalt = generatePseudoRandomSalt;
function getPriceParameters(network, orderSide, tokenAddress, expirationTime, startAmount, endAmount, waitingForBestCounterOrder, englishAuctionReservePrice) {
    if (waitingForBestCounterOrder === void 0) { waitingForBestCounterOrder = false; }
    var priceDiff = endAmount != undefined ? startAmount - endAmount : 0;
    var paymentToken = tokenAddress.toLowerCase();
    var isEther = tokenAddress == constants_1.NULL_ADDRESS;
    var token;
    if (!isEther) {
        var tokenList = getTokenList(network);
        token = tokenList.find(function (val) { return val.address.toLowerCase() == paymentToken; });
    }
    // Validation
    if (isNaN(startAmount) || startAmount == undefined || startAmount < 0) {
        throw new error_1.ElementError({ code: 1000, message: "Starting price must be a number >= 0" });
    }
    if (!isEther && !token) {
        throw new error_1.ElementError({ code: 1000, message: "No ERC-20 token found for '" + paymentToken + "'" });
    }
    if (isEther && waitingForBestCounterOrder) {
        throw new error_1.ElementError({ code: 1000, message: "English auctions must use wrapped ETH or an ERC-20 token." });
    }
    // if (isEther && orderSide === OrderSide.Buy) {
    //   throw new Error(`Offers must use wrapped ETH or an ERC-20 token.`)
    // }
    if (priceDiff < 0) {
        throw new error_1.ElementError({ code: 1000, message: 'End price must be less than or equal to the start price.' });
    }
    if (priceDiff > 0 && expirationTime == 0) {
        throw new error_1.ElementError({ code: 1000, message: 'Expiration time must be set if order will change in price.' });
    }
    if (englishAuctionReservePrice && !waitingForBestCounterOrder) {
        throw new error_1.ElementError({ code: 1000, message: 'Reserve prices may only be set on English auctions.' });
    }
    if (englishAuctionReservePrice && englishAuctionReservePrice < startAmount) {
        throw new error_1.ElementError({ code: 1000, message: 'Reserve price must be greater than or equal to the start amount.' });
    }
    // Note: WyvernProtocol.toBaseUnitAmount(makeBigNumber(startAmount), token.decimals)
    // will fail if too many decimal places, so special-case ether
    var basePrice = isEther
        ? toBaseUnitAmount(makeBigNumber(startAmount), 18)
        : toBaseUnitAmount(makeBigNumber(startAmount), token.decimals);
    var extra = isEther
        ? toBaseUnitAmount(makeBigNumber(priceDiff), 18)
        : toBaseUnitAmount(makeBigNumber(priceDiff), token.decimals);
    var reservePrice = englishAuctionReservePrice;
    return { basePrice: basePrice, extra: extra, paymentToken: paymentToken, reservePrice: reservePrice };
}
exports.getPriceParameters = getPriceParameters;
function getTimeParameters(expirationTimestamp, listingTimestamp, waitingForBestCounterOrder) {
    if (waitingForBestCounterOrder === void 0) { waitingForBestCounterOrder = false; }
    // Validation
    var minExpirationTimestamp = Math.round(Date.now() / 1000 + constants_1.MIN_EXPIRATION_SECONDS);
    var minListingTimestamp = Math.round(Date.now() / 1000);
    if (expirationTimestamp != 0 && expirationTimestamp < minExpirationTimestamp) {
        throw new error_1.ElementError({
            code: 1000,
            message: "Expiration time must be at least " + constants_1.MIN_EXPIRATION_SECONDS + " seconds from now, or zero (non-expiring)."
        });
    }
    if (listingTimestamp && listingTimestamp < minListingTimestamp) {
        throw new error_1.ElementError({ code: 1000, message: 'Listing time cannot be in the past.' });
    }
    if (listingTimestamp && expirationTimestamp !== 0 && listingTimestamp >= expirationTimestamp) {
        throw new error_1.ElementError({ code: 1000, message: 'Listing time must be before the expiration time.' });
    }
    if (waitingForBestCounterOrder && expirationTimestamp == 0) {
        throw new error_1.ElementError({ code: 1000, message: 'English auctions must have an expiration time.' });
    }
    if (waitingForBestCounterOrder && listingTimestamp) {
        throw new error_1.ElementError({ code: 1000, message: "Cannot schedule an English auction for the future." });
    }
    if (Number.parseInt(expirationTimestamp.toString()) != expirationTimestamp) {
        throw new error_1.ElementError({ code: 1000, message: "Expiration timestamp must be a whole number of seconds" });
    }
    if (waitingForBestCounterOrder) {
        listingTimestamp = expirationTimestamp;
        // Expire one week from now, to ensure server can match it
        // Later, this will expire closer to the listingTime
        expirationTimestamp += constants_1.ORDER_MATCHING_LATENCY_SECONDS;
    }
    else {
        // Small offset to account for latency
        listingTimestamp = listingTimestamp || Math.round(Date.now() / 1000 - 100);
    }
    return {
        listingTime: makeBigNumber(listingTimestamp),
        expirationTime: makeBigNumber(expirationTimestamp)
    };
}
exports.getTimeParameters = getTimeParameters;
function _makeBuyOrder(_a) {
    var networkName = _a.networkName, exchangeAddr = _a.exchangeAddr, asset = _a.asset, quantity = _a.quantity, accountAddress = _a.accountAddress, startAmount = _a.startAmount, _b = _a.expirationTime, expirationTime = _b === void 0 ? 0 : _b, paymentTokenAddress = _a.paymentTokenAddress, _c = _a.extraBountyBasisPoints, extraBountyBasisPoints = _c === void 0 ? 0 : _c, sellOrder = _a.sellOrder, referrerAddress = _a.referrerAddress;
    return __awaiter(this, void 0, void 0, function () {
        var _d, schema, elementAsset, quantityBN, taker, feeRecipient, feeMethod, _e, target, dataToCall, replacementPattern, _f, basePrice, extra, paymentToken, times;
        return __generator(this, function (_g) {
            _d = getSchemaAndAsset(networkName, asset, quantity), schema = _d.schema, elementAsset = _d.elementAsset, quantityBN = _d.quantityBN;
            taker = sellOrder ? sellOrder.maker : constants_1.NULL_ADDRESS;
            feeRecipient = constants_1.NULL_ADDRESS;
            feeMethod = types_1.FeeMethod.SplitFee;
            _e = schema_1.encodeBuy(schema, elementAsset, accountAddress), target = _e.target, dataToCall = _e.dataToCall, replacementPattern = _e.replacementPattern;
            _f = getPriceParameters(networkName, types_1.OrderSide.Buy, paymentTokenAddress, expirationTime, startAmount), basePrice = _f.basePrice, extra = _f.extra, paymentToken = _f.paymentToken;
            times = getTimeParameters(expirationTime);
            return [2 /*return*/, {
                    exchange: exchangeAddr,
                    maker: accountAddress,
                    taker: taker,
                    quantity: quantityBN,
                    makerRelayerFee: makeBigNumber(250),
                    takerRelayerFee: makeBigNumber(0),
                    makerProtocolFee: makeBigNumber(0),
                    takerProtocolFee: makeBigNumber(0),
                    makerReferrerFee: makeBigNumber(0),
                    waitingForBestCounterOrder: false,
                    feeMethod: feeMethod,
                    feeRecipient: feeRecipient,
                    side: types_1.OrderSide.Buy,
                    saleKind: types_1.SaleKind.FixedPrice,
                    target: target,
                    howToCall: types_1.HowToCall.Call,
                    dataToCall: dataToCall,
                    replacementPattern: replacementPattern,
                    staticTarget: constants_1.NULL_ADDRESS,
                    staticExtradata: '0x',
                    paymentToken: paymentToken,
                    basePrice: basePrice,
                    extra: extra,
                    listingTime: times.listingTime,
                    expirationTime: times.expirationTime,
                    salt: generatePseudoRandomSalt(),
                    metadata: {
                        asset: elementAsset,
                        schema: schema.name,
                        referrerAddress: referrerAddress
                    }
                }];
        });
    });
}
exports._makeBuyOrder = _makeBuyOrder;
function _makeSellOrder(_a) {
    var networkName = _a.networkName, exchangeAddr = _a.exchangeAddr, asset = _a.asset, quantity = _a.quantity, accountAddress = _a.accountAddress, startAmount = _a.startAmount, endAmount = _a.endAmount, listingTime = _a.listingTime, expirationTime = _a.expirationTime, waitForHighestBid = _a.waitForHighestBid, _b = _a.englishAuctionReservePrice, englishAuctionReservePrice = _b === void 0 ? 0 : _b, paymentTokenAddress = _a.paymentTokenAddress, extraBountyBasisPoints = _a.extraBountyBasisPoints, buyerAddress = _a.buyerAddress;
    return __awaiter(this, void 0, void 0, function () {
        var _c, schema, elementAsset, quantityBN, _d, target, dataToCall, replacementPattern, orderSaleKind, _e, basePrice, extra, paymentToken, reservePrice, times, feeRecipient, feeMethod;
        return __generator(this, function (_f) {
            _c = getSchemaAndAsset(networkName, asset, quantity), schema = _c.schema, elementAsset = _c.elementAsset, quantityBN = _c.quantityBN;
            _d = schema_1.encodeSell(schema, elementAsset, accountAddress), target = _d.target, dataToCall = _d.dataToCall, replacementPattern = _d.replacementPattern;
            orderSaleKind = endAmount !== undefined && endAmount !== startAmount ? types_1.SaleKind.DutchAuction : types_1.SaleKind.FixedPrice;
            _e = getPriceParameters(networkName, types_1.OrderSide.Sell, paymentTokenAddress, expirationTime, startAmount, endAmount, waitForHighestBid, englishAuctionReservePrice), basePrice = _e.basePrice, extra = _e.extra, paymentToken = _e.paymentToken, reservePrice = _e.reservePrice;
            times = getTimeParameters(expirationTime, listingTime, waitForHighestBid);
            feeRecipient = accountAddress;
            feeMethod = types_1.FeeMethod.SplitFee;
            return [2 /*return*/, {
                    exchange: exchangeAddr,
                    maker: accountAddress,
                    taker: buyerAddress,
                    quantity: quantityBN,
                    makerRelayerFee: makeBigNumber(250),
                    takerRelayerFee: makeBigNumber(0),
                    makerProtocolFee: makeBigNumber(0),
                    takerProtocolFee: makeBigNumber(0),
                    makerReferrerFee: makeBigNumber(0),
                    waitingForBestCounterOrder: waitForHighestBid,
                    englishAuctionReservePrice: reservePrice ? makeBigNumber(reservePrice) : undefined,
                    feeMethod: feeMethod,
                    feeRecipient: feeRecipient,
                    side: types_1.OrderSide.Sell,
                    saleKind: orderSaleKind,
                    target: target,
                    howToCall: types_1.HowToCall.Call,
                    dataToCall: dataToCall,
                    replacementPattern: replacementPattern,
                    staticTarget: constants_1.NULL_ADDRESS,
                    staticExtradata: '0x',
                    paymentToken: paymentToken,
                    basePrice: basePrice,
                    extra: extra,
                    listingTime: times.listingTime,
                    expirationTime: times.expirationTime,
                    salt: generatePseudoRandomSalt(),
                    metadata: {
                        asset: elementAsset,
                        schema: schema.name
                    }
                }];
        });
    });
}
exports._makeSellOrder = _makeSellOrder;
function getTokenList(network, symbol) {
    var payTokens = tokens_1.tokens[network];
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
    if (!schemaList) {
        throw new Error("Trading for this Network (" + network + ") is not yet supported. Please contact us or check back later!");
    }
    if (schemaName) {
        schemaList = schemaList.filter(function (val) { return val.name === schemaName; });
    }
    return schemaList;
}
exports.getSchemaList = getSchemaList;
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
        orderSigValueArray.push(order[key]);
    }
    return orderSigValueArray;
}
exports.orderSigEncode = orderSigEncode;
function getOrderHash(web3, exchangeHelper, order) {
    return __awaiter(this, void 0, void 0, function () {
        var orderParamValueArray;
        return __generator(this, function (_a) {
            orderParamValueArray = orderParamsEncode(order);
            return [2 /*return*/, exchangeHelper.methods.hashOrder(orderParamValueArray).call()];
        });
    });
}
exports.getOrderHash = getOrderHash;
function hashAndValidateOrder(web3, exchangeHelper, order) {
    return __awaiter(this, void 0, void 0, function () {
        var orderHash, hashedOrder, signature, orderWithSignature;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getOrderHash(web3, exchangeHelper, order)
                    // let orderHash = hashOrder(web3, order)
                ];
                case 1:
                    orderHash = _a.sent();
                    hashedOrder = __assign(__assign({}, order), { hash: orderHash });
                    if (!(web3.eth.defaultAccount.toLowerCase() == hashedOrder.maker.toLowerCase())) return [3 /*break*/, 3];
                    return [4 /*yield*/, signOrderHash(web3, hashedOrder)];
                case 2:
                    signature = _a.sent();
                    return [3 /*break*/, 4];
                case 3: throw new error_1.ElementError({ code: 1000, message: 'web3.eth.defaultAccount and maker not equal' });
                case 4:
                    orderWithSignature = __assign(__assign({}, hashedOrder), signature);
                    return [4 /*yield*/, check_1.validateOrder(exchangeHelper, orderWithSignature)];
                case 5:
                    _a.sent();
                    return [2 /*return*/, exports.orderToJSON(orderWithSignature)];
            }
        });
    });
}
exports.hashAndValidateOrder = hashAndValidateOrder;
function signOrderHash(web3, hashedOrder) {
    return __awaiter(this, void 0, void 0, function () {
        var signature, signatureRes, signatureHex, error_2;
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
                    error_2 = _a.sent();
                    throw new error_1.ElementError({ code: 1000, message: 'You declined to authorize your auction' });
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
function schemaEncodeSell(network, schema, owner, data) {
    var schemaDefine = getSchemaList(network, schema);
    // schemaDefine = schemaDefine[0]
    var assetFiled = {};
    var fields = schemaDefine.fields;
    for (var _i = 0, fields_1 = fields; _i < fields_1.length; _i++) {
        var field = fields_1[_i];
        var val = data[field.name];
        if (!val) {
            throw field.name + ' is require！';
        }
        if (field.type == 'address') {
            val = val.toLowerCase();
        }
        if (field.type == 'address') {
            val = val.toLowerCase();
        }
        assetFiled[field.name] = val;
    }
    var asset = schemaDefine.assetFromFields(assetFiled);
    var abi = schemaDefine.functions.transfer(asset);
    var kind = abi.inputs.some(function (val) { return val.kind == 'owner'; });
    if (kind) {
        if (!owner) {
            throw 'must have owner field!';
        }
    }
    var _a = schema_1.encodeSell(schemaDefine, asset, owner), target = _a.target, dataToCall = _a.dataToCall, replacementPattern = _a.replacementPattern; //target,
    return { target: target, dataToCall: dataToCall, replacementPattern: replacementPattern };
}
exports.schemaEncodeSell = schemaEncodeSell;
function hashOrder(web3, order) {
    return web3.utils
        .soliditySha3({ type: 'address', value: order.exchange }, { type: 'address', value: order.maker }, { type: 'address', value: order.taker }, { type: 'uint', value: order.makerRelayerFee }, { type: 'uint', value: order.takerRelayerFee }, { type: 'uint', value: order.takerProtocolFee }, { type: 'uint', value: order.takerProtocolFee }, { type: 'address', value: order.feeRecipient }, { type: 'uint8', value: order.feeMethod }, { type: 'uint8', value: order.side }, { type: 'uint8', value: order.saleKind }, { type: 'address', value: order.target }, { type: 'uint8', value: order.howToCall }, { type: 'bytes', value: order.dataToCall }, { type: 'bytes', value: order.replacementPattern }, { type: 'address', value: order.staticTarget }, { type: 'bytes', value: order.staticExtradata }, { type: 'address', value: order.paymentToken }, { type: 'uint', value: order.basePrice }, { type: 'uint', value: order.extra }, { type: 'uint', value: order.listingTime }, { type: 'uint', value: order.expirationTime }, { type: 'uint', value: order.salt })
        .toString('hex');
}
exports.hashOrder = hashOrder;
