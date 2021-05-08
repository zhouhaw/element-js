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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._makeSellOrder = exports._makeBuyOrder = exports.getTimeParameters = exports.getPriceParameters = exports.generatePseudoRandomSalt = exports.getElementAsset = exports.getSchema = exports.makeBigNumber = void 0;
var types_1 = require("../types");
var index_1 = require("./index");
var schemas_1 = require("../schema/schemas");
var bignumber_js_1 = __importDefault(require("bignumber.js"));
bignumber_js_1.default.config({ EXPONENTIAL_AT: 1e9 });
function makeBigNumber(arg) {
    // Zero sometimes returned as 0x from contracts
    if (arg === '0x') {
        arg = 0;
    }
    // fix "new BigNumber() number type has more than 15 significant digits"
    arg = arg.toString();
    return new bignumber_js_1.default(arg);
}
exports.makeBigNumber = makeBigNumber;
function getSchema(network, schemaName) {
    var schemaName_ = schemaName || types_1.ElementSchemaName.ERC1155;
    // @ts-ignore
    var scahmaList = schemas_1.schemas[network];
    if (!scahmaList) {
        throw new Error("Trading for this Network (" + network + ") is not yet supported. Please contact us or check back later!");
    }
    var schemaInfo = scahmaList.find(function (val) { return val.name === schemaName_; });
    if (!schemaInfo) {
        throw new Error("Trading for this asset (" + schemaName_ + ") is not yet supported. Please contact us or check back later!");
    }
    return schemaInfo;
}
exports.getSchema = getSchema;
function getElementAsset(schema, asset, quantity) {
    if (quantity === void 0) { quantity = new bignumber_js_1.default(1); }
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
function generatePseudoRandomSalt() {
    // BigNumber.random returns a pseudo-random number between 0 & 1 with a passed in number of decimal places.
    // Source: https://mikemcl.github.io/bignumber.js/#random
    var randomNumber = bignumber_js_1.default.random(index_1.MAX_DIGITS_IN_UNSIGNED_256_INT);
    var factor = new bignumber_js_1.default(10).pow(index_1.MAX_DIGITS_IN_UNSIGNED_256_INT - 1);
    var salt = randomNumber.times(factor).integerValue();
    return salt;
}
exports.generatePseudoRandomSalt = generatePseudoRandomSalt;
function toBaseUnitAmount(amount, decimals) {
    var unit = new bignumber_js_1.default(10).pow(decimals);
    var baseUnitAmount = amount.times(unit).integerValue();
    return baseUnitAmount;
}
function getPriceParameters(network, orderSide, tokenAddress, expirationTime, startAmount, endAmount, waitingForBestCounterOrder, englishAuctionReservePrice) {
    if (waitingForBestCounterOrder === void 0) { waitingForBestCounterOrder = false; }
    var priceDiff = endAmount != undefined ? startAmount - endAmount : 0;
    var paymentToken = tokenAddress.toLowerCase();
    var isEther = tokenAddress == index_1.NULL_ADDRESS;
    var token;
    if (!isEther) {
        var tokenList = index_1.getTokenList(network);
        token = tokenList.find(function (val) { return val.address.toLowerCase() == paymentToken; });
    }
    // Validation
    if (isNaN(startAmount) || startAmount == undefined || startAmount < 0) {
        throw new Error("Starting price must be a number >= 0");
    }
    if (!isEther && !token) {
        throw new Error("No ERC-20 token found for '" + paymentToken + "'");
    }
    if (isEther && waitingForBestCounterOrder) {
        throw new Error("English auctions must use wrapped ETH or an ERC-20 token.");
    }
    // if (isEther && orderSide === OrderSide.Buy) {
    //   throw new Error(`Offers must use wrapped ETH or an ERC-20 token.`)
    // }
    if (priceDiff < 0) {
        throw new Error('End price must be less than or equal to the start price.');
    }
    if (priceDiff > 0 && expirationTime == 0) {
        throw new Error('Expiration time must be set if order will change in price.');
    }
    if (englishAuctionReservePrice && !waitingForBestCounterOrder) {
        throw new Error('Reserve prices may only be set on English auctions.');
    }
    if (englishAuctionReservePrice && englishAuctionReservePrice < startAmount) {
        throw new Error('Reserve price must be greater than or equal to the start amount.');
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
var MIN_EXPIRATION_SECONDS = 10;
var ORDER_MATCHING_LATENCY_SECONDS = 60 * 60 * 24 * 7;
function getTimeParameters(expirationTimestamp, listingTimestamp, waitingForBestCounterOrder) {
    if (waitingForBestCounterOrder === void 0) { waitingForBestCounterOrder = false; }
    // Validation
    var minExpirationTimestamp = Math.round(Date.now() / 1000 + MIN_EXPIRATION_SECONDS);
    var minListingTimestamp = Math.round(Date.now() / 1000);
    if (expirationTimestamp != 0 && expirationTimestamp < minExpirationTimestamp) {
        throw new Error("Expiration time must be at least " + MIN_EXPIRATION_SECONDS + " seconds from now, or zero (non-expiring).");
    }
    if (listingTimestamp && listingTimestamp < minListingTimestamp) {
        throw new Error('Listing time cannot be in the past.');
    }
    if (listingTimestamp && expirationTimestamp !== 0 && listingTimestamp >= expirationTimestamp) {
        throw new Error('Listing time must be before the expiration time.');
    }
    if (waitingForBestCounterOrder && expirationTimestamp == 0) {
        throw new Error('English auctions must have an expiration time.');
    }
    if (waitingForBestCounterOrder && listingTimestamp) {
        throw new Error("Cannot schedule an English auction for the future.");
    }
    if (Number.parseInt(expirationTimestamp.toString()) != expirationTimestamp) {
        throw new Error("Expiration timestamp must be a whole number of seconds");
    }
    if (waitingForBestCounterOrder) {
        listingTimestamp = expirationTimestamp;
        // Expire one week from now, to ensure server can match it
        // Later, this will expire closer to the listingTime
        expirationTimestamp += ORDER_MATCHING_LATENCY_SECONDS;
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
        var schema, quantityBN, wyAsset, taker, feeRecipient, feeMethod, _d, target, dataToCall, replacementPattern, _e, basePrice, extra, paymentToken, times;
        return __generator(this, function (_f) {
            schema = getSchema(networkName, asset.schemaName);
            quantityBN = makeBigNumber(quantity) // WyvernProtocol.toBaseUnitAmount(makeBigNumber(quantity), asset.decimals || 0)
            ;
            wyAsset = getElementAsset(schema, asset, quantityBN);
            taker = sellOrder ? sellOrder.maker : index_1.NULL_ADDRESS;
            feeRecipient = index_1.NULL_ADDRESS;
            feeMethod = types_1.FeeMethod.SplitFee;
            _d = index_1.encodeBuy(schema, wyAsset, accountAddress), target = _d.target, dataToCall = _d.dataToCall, replacementPattern = _d.replacementPattern;
            _e = getPriceParameters(networkName, types_1.OrderSide.Buy, paymentTokenAddress, expirationTime, startAmount), basePrice = _e.basePrice, extra = _e.extra, paymentToken = _e.paymentToken;
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
                    staticTarget: index_1.NULL_ADDRESS,
                    staticExtradata: '0x',
                    paymentToken: paymentToken,
                    basePrice: basePrice,
                    extra: extra,
                    listingTime: times.listingTime,
                    expirationTime: times.expirationTime,
                    salt: generatePseudoRandomSalt(),
                    metadata: {
                        asset: wyAsset,
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
        var schema, quantityBN, wyAsset, _c, target, dataToCall, replacementPattern, orderSaleKind, _d, basePrice, extra, paymentToken, reservePrice, times, feeRecipient, feeMethod;
        return __generator(this, function (_e) {
            schema = getSchema(networkName, asset.schemaName);
            quantityBN = makeBigNumber(quantity);
            wyAsset = getElementAsset(schema, asset, quantityBN);
            _c = index_1.encodeSell(schema, wyAsset, accountAddress), target = _c.target, dataToCall = _c.dataToCall, replacementPattern = _c.replacementPattern;
            orderSaleKind = endAmount !== undefined && endAmount !== startAmount ? types_1.SaleKind.DutchAuction : types_1.SaleKind.FixedPrice;
            _d = getPriceParameters(networkName, types_1.OrderSide.Sell, paymentTokenAddress, expirationTime, startAmount, endAmount, waitForHighestBid, englishAuctionReservePrice), basePrice = _d.basePrice, extra = _d.extra, paymentToken = _d.paymentToken, reservePrice = _d.reservePrice;
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
                    staticTarget: index_1.NULL_ADDRESS,
                    staticExtradata: '0x',
                    paymentToken: paymentToken,
                    basePrice: basePrice,
                    extra: extra,
                    listingTime: times.listingTime,
                    expirationTime: times.expirationTime,
                    salt: generatePseudoRandomSalt(),
                    metadata: {
                        asset: wyAsset,
                        schema: schema.name
                    }
                }];
        });
    });
}
exports._makeSellOrder = _makeSellOrder;
