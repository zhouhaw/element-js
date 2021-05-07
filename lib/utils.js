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
exports.getTokenList = exports.estimateCurrentPrice = exports.INVERSE_BASIS_POINT = exports.orderFromJSON = exports.orderToJSON = exports.validateAndPostOrder = exports.signOrderHash = exports.getTimeParameters = exports.ORDER_MATCHING_LATENCY_SECONDS = exports.MIN_EXPIRATION_SECONDS = exports.getPriceParameters = exports.generatePseudoRandomSalt = exports.getElementAsset = exports.getSchema = exports.validateAndFormatWalletAddress = exports.hashOrder = exports.orderCanMatch = exports.validateOrder = exports.getOrderHash = exports.orderSigEncode = exports.orderParamsEncode = exports.makeBigNumber = exports.registerProxy = exports.NULL_ADDRESS = exports.encodeSell = exports.encodeBuy = void 0;
var bignumber_js_1 = __importDefault(require("bignumber.js"));
var schemas_1 = require("./schema/schemas");
var tokens_1 = require("./schema/tokens");
var types_1 = require("./types");
var schema_1 = require("./schema");
Object.defineProperty(exports, "encodeBuy", { enumerable: true, get: function () { return schema_1.encodeBuy; } });
Object.defineProperty(exports, "encodeSell", { enumerable: true, get: function () { return schema_1.encodeSell; } });
bignumber_js_1.default.config({ EXPONENTIAL_AT: 1e9 });
exports.NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
function registerProxy(proxyRegistryContract, account) {
    return __awaiter(this, void 0, void 0, function () {
        var proxy, rawTxNew;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, proxyRegistryContract.methods.proxies(account).call()];
                case 1:
                    proxy = _a.sent();
                    if (!(proxy === exports.NULL_ADDRESS)) return [3 /*break*/, 3];
                    return [4 /*yield*/, proxyRegistryContract.methods.registerProxy().send({
                            from: account
                        })];
                case 2:
                    rawTxNew = _a.sent();
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/, proxy];
            }
        });
    });
}
exports.registerProxy = registerProxy;
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
                    return [4 /*yield*/, exchangeHelper.methods
                            .hashOrder(orderParamValueArray)
                            .call()
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
            return [2 /*return*/, exchangeHelper.methods
                    .validateOrder(orderParamValueArray, orderSigArray)
                    .call()];
        });
    });
}
exports.validateOrder = validateOrder;
var canSettleOrder = function (listingTime, expirationTime) {
    var now = (new Date().getTime()) / 1000;
    return (listingTime.toNumber() < now) && (expirationTime.toNumber() == 0 || now < expirationTime.toNumber());
};
function orderCanMatch(buy, sell) {
    console.log(exports.NULL_ADDRESS);
    return (buy.side == 0 && sell.side == 1) &&
        /* Must use same fee method. */
        (buy.feeMethod == sell.feeMethod) &&
        /* Must use same payment token. */
        (buy.paymentToken == sell.paymentToken) &&
        /* Must match maker/taker addresses. */
        (sell.taker == exports.NULL_ADDRESS || sell.taker == buy.maker) &&
        (buy.taker == exports.NULL_ADDRESS || buy.taker == sell.maker) &&
        /* One must be maker and the other must be taker (no bool XOR in Solidity). */
        ((sell.feeRecipient == exports.NULL_ADDRESS && buy.feeRecipient != exports.NULL_ADDRESS) || (sell.feeRecipient != exports.NULL_ADDRESS && buy.feeRecipient == exports.NULL_ADDRESS)) &&
        /* Must match target. */
        (buy.target == sell.target) &&
        /* Must match howToCall. */
        (buy.howToCall == sell.howToCall) &&
        /* Buy-side order must be settleable. */
        canSettleOrder(buy.listingTime, buy.expirationTime) &&
        /* Sell-side order must be settleable. */
        canSettleOrder(sell.listingTime, sell.expirationTime);
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
        Data: asset.data || "",
    });
}
exports.getElementAsset = getElementAsset;
function generatePseudoRandomSalt() {
    // BigNumber.random returns a pseudo-random number between 0 & 1 with a passed in number of decimal places.
    // Source: https://mikemcl.github.io/bignumber.js/#random
    var MAX_DIGITS_IN_UNSIGNED_256_INT = 18; // 78
    var randomNumber = bignumber_js_1.default.random(MAX_DIGITS_IN_UNSIGNED_256_INT);
    var factor = new bignumber_js_1.default(10).pow(MAX_DIGITS_IN_UNSIGNED_256_INT - 1);
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
    var isEther = tokenAddress == exports.NULL_ADDRESS;
    var token;
    if (!isEther) {
        var tokenList = getTokenList(network);
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
exports.MIN_EXPIRATION_SECONDS = 10;
exports.ORDER_MATCHING_LATENCY_SECONDS = 60 * 60 * 24 * 7;
function getTimeParameters(expirationTimestamp, listingTimestamp, waitingForBestCounterOrder) {
    if (waitingForBestCounterOrder === void 0) { waitingForBestCounterOrder = false; }
    // Validation
    var minExpirationTimestamp = Math.round(Date.now() / 1000 + exports.MIN_EXPIRATION_SECONDS);
    var minListingTimestamp = Math.round(Date.now() / 1000);
    if (expirationTimestamp != 0 &&
        expirationTimestamp < minExpirationTimestamp) {
        throw new Error("Expiration time must be at least " + exports.MIN_EXPIRATION_SECONDS + " seconds from now, or zero (non-expiring).");
    }
    if (listingTimestamp && listingTimestamp < minListingTimestamp) {
        throw new Error('Listing time cannot be in the past.');
    }
    if (listingTimestamp &&
        expirationTimestamp !== 0 &&
        listingTimestamp >= expirationTimestamp) {
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
        expirationTimestamp += exports.ORDER_MATCHING_LATENCY_SECONDS;
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
function signOrderHash(web3, hashedOrder) {
    return __awaiter(this, void 0, void 0, function () {
        var signature, signatureRes, signatureHex, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, web3.eth.sign(hashedOrder.hash, hashedOrder.maker)];
                case 1:
                    signatureRes = _a.sent();
                    signatureHex = signatureRes.slice(2);
                    signature = {
                        v: Number.parseInt(signatureHex.slice(128, 130), 16),
                        r: "0x" + signatureHex.slice(0, 64),
                        s: "0x" + signatureHex.slice(64, 128)
                    };
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error(error_1);
                    throw new Error('You declined to authorize your auction');
                case 3: return [2 /*return*/, signature];
            }
        });
    });
}
exports.signOrderHash = signOrderHash;
function validateAndPostOrder(web3, order) {
    return __awaiter(this, void 0, void 0, function () {
        var hash;
        return __generator(this, function (_a) {
            hash = hashOrder(web3, order);
            if (hash !== order.hash) {
                console.error(order);
                throw new Error("Order couldn't be validated by the exchange due to a hash mismatch. Make sure your wallet is on the right network!");
            }
            // Validation is called server-side
            // const confirmedOrder = await this.api.postOrder()
            return [2 /*return*/, exports.orderToJSON(order)];
        });
    });
}
exports.validateAndPostOrder = validateAndPostOrder;
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
        // Use string address to conform to Wyvern Order schema
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
exports.INVERSE_BASIS_POINT = 10000;
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
        var diff = extra
            .times(now.minus(listingTime))
            .dividedBy(expirationTime.minus(listingTime));
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
        exactPrice = exactPrice.times(+takerRelayerFee / exports.INVERSE_BASIS_POINT + 1);
    }
    return shouldRoundUp ? exactPrice.abs() : exactPrice;
}
exports.estimateCurrentPrice = estimateCurrentPrice;
// ------------Buy----------------
function getTokenList(network) {
    var payTokens = tokens_1.tokens[network];
    return __spreadArray([payTokens.canonicalWrappedEther], payTokens.otherTokens);
}
exports.getTokenList = getTokenList;
