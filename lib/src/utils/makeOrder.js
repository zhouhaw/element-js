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
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignOrdersToSides = exports._makeMatchingOrder = exports.computeOrderCallData = exports.computeOrderParams = exports._getStaticCallTargetAndExtraData = exports.getCurrentPrice = exports.schemaEncodeSell = exports.orderToJSON = exports.signOrderHash = exports.hashAndValidateOrder = exports.getOrderHash = exports._makeSellOrder = exports._makeBuyOrder = exports.getTimeParameters = exports.getPriceParameters = exports.generatePseudoRandomSalt = exports.getSchemaAndAsset = exports.getElementAsset = exports.getSchema = void 0;
var types_1 = require("../types");
var schema_1 = require("../schema");
var error_1 = require("../base/error");
var fees_1 = require("./fees");
var constants_1 = require("./constants");
var check_1 = require("./check");
var helper_1 = require("./helper");
function getSchema(network, schemaName) {
    var schemaName_ = schemaName;
    var schemaInfo = helper_1.getSchemaList(network, schemaName_); // scahmaList.find((val: Schema<any>) => val.name === schemaName_)
    if (schemaInfo.length == 0) {
        throw new error_1.ElementError({ code: '1107', context: { schemaName: schemaName_ } });
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
    var quantityBN = helper_1.makeBigNumber(quantity);
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
function getPriceParameters(network, orderSide, paymentTokenObj, expirationTime, startAmount, endAmount, waitingForBestCounterOrder, englishAuctionReservePrice) {
    if (waitingForBestCounterOrder === void 0) { waitingForBestCounterOrder = false; }
    var priceDiff = endAmount != undefined ? startAmount - endAmount : 0;
    var token = paymentTokenObj;
    var paymentToken = token.address.toLowerCase();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    var tokenDecimals = token.decimals || token.decimal;
    var isEther = token.address == constants_1.NULL_ADDRESS;
    // if (!isEther) {
    //   const tokenList = getTokenList(network)
    //   token = tokenList.find((val) => val.address.toLowerCase() == paymentToken)
    // }
    // Validation
    if (isNaN(startAmount) || startAmount == undefined || startAmount < 0) {
        throw new error_1.ElementError({ code: '1000', message: "Starting price must be a number >= 0" });
    }
    if (!isEther && !token) {
        throw new error_1.ElementError({ code: '1000', message: "No ERC-20 token found for '" + paymentToken + "'" });
    }
    if (isEther && waitingForBestCounterOrder) {
        throw new error_1.ElementError({ code: '1000', message: "English auctions must use wrapped ETH or an ERC-20 token." });
    }
    // if (isEther && orderSide === OrderSide.Buy) {
    //   throw new Error(`Offers must use wrapped ETH or an ERC-20 token.`)
    // }
    if (priceDiff < 0) {
        throw new error_1.ElementError({ code: '1000', message: 'End price must be less than or equal to the start price.' });
    }
    if (priceDiff > 0 && expirationTime == 0) {
        throw new error_1.ElementError({ code: '1000', message: 'Expiration time must be set if order will change in price.' });
    }
    if (englishAuctionReservePrice && !waitingForBestCounterOrder) {
        throw new error_1.ElementError({ code: '1000', message: 'Reserve prices may only be set on English auctions.' });
    }
    if (englishAuctionReservePrice && englishAuctionReservePrice < startAmount) {
        throw new error_1.ElementError({
            code: '1000',
            message: 'Reserve price must be greater than or equal to the start amount.'
        });
    }
    // Note: WyvernProtocol.toBaseUnitAmount(makeBigNumber(startAmount), tokenDecimals)
    // will fail if too many decimal places, so special-case ether
    var basePrice = helper_1.toBaseUnitAmount(helper_1.makeBigNumber(startAmount), tokenDecimals);
    var extra = helper_1.toBaseUnitAmount(helper_1.makeBigNumber(priceDiff), tokenDecimals);
    var reservePrice = englishAuctionReservePrice
        ? helper_1.toBaseUnitAmount(helper_1.makeBigNumber(englishAuctionReservePrice), tokenDecimals)
        : undefined;
    return { basePrice: basePrice, extra: extra, paymentToken: paymentToken, reservePrice: reservePrice };
}
exports.getPriceParameters = getPriceParameters;
function getTimeParameters(expirationTimestamp, listingTimestamp, waitingForBestCounterOrder) {
    if (waitingForBestCounterOrder === void 0) { waitingForBestCounterOrder = false; }
    // Validation
    var minExpirationTimestamp = Math.round(Date.now() / 1000 + constants_1.MIN_EXPIRATION_SECONDS);
    var minListingTimestamp = Math.round(Date.now() / 1000 - 1);
    if (expirationTimestamp != 0 && expirationTimestamp < minExpirationTimestamp) {
        throw new error_1.ElementError({
            code: '1000',
            message: "Expiration time must be at least " + constants_1.MIN_EXPIRATION_SECONDS + " seconds from now, or zero (non-expiring)."
        });
    }
    if (listingTimestamp && listingTimestamp < minListingTimestamp) {
        throw new error_1.ElementError({ code: '1000', message: 'Listing time cannot be in the past.' });
    }
    if (listingTimestamp && expirationTimestamp !== 0 && listingTimestamp >= expirationTimestamp) {
        throw new error_1.ElementError({ code: '1000', message: 'Listing time must be before the expiration time.' });
    }
    if (waitingForBestCounterOrder && expirationTimestamp == 0) {
        throw new error_1.ElementError({ code: '1000', message: 'English auctions must have an expiration time.' });
    }
    if (waitingForBestCounterOrder && listingTimestamp) {
        throw new error_1.ElementError({ code: '1000', message: "Cannot schedule an English auction for the future." });
    }
    if (Number.parseInt(expirationTimestamp.toString()) != expirationTimestamp) {
        throw new error_1.ElementError({ code: '1000', message: "Expiration timestamp must be a whole number of seconds" });
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
        listingTime: helper_1.makeBigNumber(listingTimestamp),
        expirationTime: helper_1.makeBigNumber(expirationTimestamp)
    };
}
exports.getTimeParameters = getTimeParameters;
function _makeBuyOrder(_a) {
    var networkName = _a.networkName, exchangeAddr = _a.exchangeAddr, asset = _a.asset, quantity = _a.quantity, accountAddress = _a.accountAddress, startAmount = _a.startAmount, _b = _a.expirationTime, expirationTime = _b === void 0 ? 0 : _b, paymentTokenObj = _a.paymentTokenObj, _c = _a.extraBountyBasisPoints, extraBountyBasisPoints = _c === void 0 ? 0 : _c, feeRecipientAddr = _a.feeRecipientAddr, sellOrder = _a.sellOrder, referrerAddress = _a.referrerAddress;
    return __awaiter(this, void 0, void 0, function () {
        var _d, schema, elementAsset, quantityBN, taker, _e, target, dataToCall, replacementPattern, _f, basePrice, extra, paymentToken, times, _g, totalBuyerFeeBasisPoints, totalSellerFeeBasisPoints, feeRecipient, _h, makerRelayerFee, takerRelayerFee, makerProtocolFee, takerProtocolFee, makerReferrerFee, feeMethod, _j, staticTarget, staticExtradata;
        return __generator(this, function (_k) {
            switch (_k.label) {
                case 0:
                    _d = getSchemaAndAsset(networkName, asset, quantity), schema = _d.schema, elementAsset = _d.elementAsset, quantityBN = _d.quantityBN;
                    taker = sellOrder ? sellOrder.maker : constants_1.NULL_ADDRESS;
                    _e = schema_1.encodeBuy(schema, elementAsset, accountAddress), target = _e.target, dataToCall = _e.dataToCall, replacementPattern = _e.replacementPattern;
                    _f = getPriceParameters(networkName, types_1.OrderSide.Buy, paymentTokenObj, expirationTime, startAmount), basePrice = _f.basePrice, extra = _f.extra, paymentToken = _f.paymentToken;
                    times = getTimeParameters(expirationTime);
                    return [4 /*yield*/, fees_1.computeFees({
                            asset: asset,
                            extraBountyBasisPoints: extraBountyBasisPoints,
                            side: types_1.OrderSide.Buy
                        })
                        // OrderSide.Buy
                    ];
                case 1:
                    _g = _k.sent(), totalBuyerFeeBasisPoints = _g.totalBuyerFeeBasisPoints, totalSellerFeeBasisPoints = _g.totalSellerFeeBasisPoints;
                    feeRecipient = feeRecipientAddr;
                    _h = fees_1._getBuyFeeParameters(totalBuyerFeeBasisPoints, totalSellerFeeBasisPoints, sellOrder), makerRelayerFee = _h.makerRelayerFee, takerRelayerFee = _h.takerRelayerFee, makerProtocolFee = _h.makerProtocolFee, takerProtocolFee = _h.takerProtocolFee, makerReferrerFee = _h.makerReferrerFee, feeMethod = _h.feeMethod;
                    return [4 /*yield*/, _getStaticCallTargetAndExtraData({
                            networkName: networkName,
                            asset: asset,
                            useTxnOriginStaticCall: false
                        })];
                case 2:
                    _j = _k.sent(), staticTarget = _j.staticTarget, staticExtradata = _j.staticExtradata;
                    return [2 /*return*/, {
                            exchange: exchangeAddr,
                            maker: accountAddress,
                            taker: taker,
                            quantity: quantityBN,
                            makerRelayerFee: makerRelayerFee,
                            takerRelayerFee: takerRelayerFee,
                            makerProtocolFee: makerProtocolFee,
                            takerProtocolFee: takerProtocolFee,
                            makerReferrerFee: makerReferrerFee,
                            waitingForBestCounterOrder: false,
                            feeMethod: feeMethod,
                            feeRecipient: feeRecipient,
                            side: types_1.OrderSide.Buy,
                            saleKind: types_1.SaleKind.FixedPrice,
                            target: target,
                            howToCall: types_1.HowToCall.Call,
                            dataToCall: dataToCall,
                            replacementPattern: replacementPattern,
                            staticTarget: staticTarget,
                            staticExtradata: staticExtradata,
                            paymentToken: paymentToken,
                            basePrice: basePrice,
                            extra: extra,
                            listingTime: times.listingTime,
                            expirationTime: times.expirationTime,
                            salt: generatePseudoRandomSalt(),
                            metadata: {
                                asset: elementAsset,
                                schema: schema.name,
                                version: schema.version
                            }
                        }];
            }
        });
    });
}
exports._makeBuyOrder = _makeBuyOrder;
function _makeSellOrder(_a) {
    var networkName = _a.networkName, exchangeAddr = _a.exchangeAddr, asset = _a.asset, quantity = _a.quantity, accountAddress = _a.accountAddress, startAmount = _a.startAmount, endAmount = _a.endAmount, listingTime = _a.listingTime, expirationTime = _a.expirationTime, waitForHighestBid = _a.waitForHighestBid, _b = _a.englishAuctionReservePrice, englishAuctionReservePrice = _b === void 0 ? 0 : _b, paymentTokenObj = _a.paymentTokenObj, extraBountyBasisPoints = _a.extraBountyBasisPoints, feeRecipientAddr = _a.feeRecipientAddr, buyerAddress = _a.buyerAddress;
    return __awaiter(this, void 0, void 0, function () {
        var _c, schema, elementAsset, quantityBN, _d, target, dataToCall, replacementPattern, orderSaleKind, _e, basePrice, extra, paymentToken, reservePrice, times, isPrivate, _f, totalSellerFeeBasisPoints, totalBuyerFeeBasisPoints, sellerBountyBasisPoints, feeRecipient, _g, makerRelayerFee, takerRelayerFee, makerProtocolFee, takerProtocolFee, makerReferrerFee, feeMethod, _h, staticTarget, staticExtradata;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    _c = getSchemaAndAsset(networkName, asset, quantity), schema = _c.schema, elementAsset = _c.elementAsset, quantityBN = _c.quantityBN;
                    _d = schema_1.encodeSell(schema, elementAsset, accountAddress), target = _d.target, dataToCall = _d.dataToCall, replacementPattern = _d.replacementPattern;
                    orderSaleKind = endAmount !== undefined && endAmount !== startAmount ? types_1.SaleKind.DutchAuction : types_1.SaleKind.FixedPrice;
                    _e = getPriceParameters(networkName, types_1.OrderSide.Sell, paymentTokenObj, expirationTime, startAmount, endAmount, waitForHighestBid, englishAuctionReservePrice), basePrice = _e.basePrice, extra = _e.extra, paymentToken = _e.paymentToken, reservePrice = _e.reservePrice;
                    times = getTimeParameters(expirationTime, listingTime, waitForHighestBid);
                    isPrivate = buyerAddress != constants_1.NULL_ADDRESS;
                    return [4 /*yield*/, fees_1.computeFees({
                            asset: asset,
                            side: types_1.OrderSide.Sell,
                            isPrivate: isPrivate,
                            extraBountyBasisPoints: extraBountyBasisPoints
                        })
                        // waitForHighestBid = false
                        // Use buyer as the maker when it's an English auction, so Wyvern sets prices correctly
                    ];
                case 1:
                    _f = _j.sent(), totalSellerFeeBasisPoints = _f.totalSellerFeeBasisPoints, totalBuyerFeeBasisPoints = _f.totalBuyerFeeBasisPoints, sellerBountyBasisPoints = _f.sellerBountyBasisPoints;
                    feeRecipient = waitForHighestBid ? constants_1.NULL_ADDRESS : feeRecipientAddr;
                    _g = fees_1._getSellFeeParameters(totalBuyerFeeBasisPoints, totalSellerFeeBasisPoints, waitForHighestBid, sellerBountyBasisPoints), makerRelayerFee = _g.makerRelayerFee, takerRelayerFee = _g.takerRelayerFee, makerProtocolFee = _g.makerProtocolFee, takerProtocolFee = _g.takerProtocolFee, makerReferrerFee = _g.makerReferrerFee, feeMethod = _g.feeMethod;
                    return [4 /*yield*/, _getStaticCallTargetAndExtraData({
                            networkName: networkName,
                            asset: asset,
                            useTxnOriginStaticCall: waitForHighestBid
                        })];
                case 2:
                    _h = _j.sent(), staticTarget = _h.staticTarget, staticExtradata = _h.staticExtradata;
                    return [2 /*return*/, {
                            exchange: exchangeAddr,
                            maker: accountAddress,
                            taker: buyerAddress,
                            quantity: quantityBN,
                            makerRelayerFee: makerRelayerFee,
                            takerRelayerFee: takerRelayerFee,
                            makerProtocolFee: makerProtocolFee,
                            takerProtocolFee: takerProtocolFee,
                            makerReferrerFee: makerReferrerFee,
                            waitingForBestCounterOrder: waitForHighestBid,
                            englishAuctionReservePrice: reservePrice ? helper_1.makeBigNumber(reservePrice) : undefined,
                            feeMethod: feeMethod,
                            feeRecipient: feeRecipient,
                            side: types_1.OrderSide.Sell,
                            saleKind: orderSaleKind,
                            target: target,
                            howToCall: types_1.HowToCall.Call,
                            dataToCall: dataToCall,
                            replacementPattern: replacementPattern,
                            staticTarget: staticTarget,
                            staticExtradata: staticExtradata,
                            paymentToken: paymentToken,
                            basePrice: basePrice,
                            extra: extra,
                            listingTime: times.listingTime,
                            expirationTime: times.expirationTime,
                            salt: generatePseudoRandomSalt(),
                            metadata: {
                                asset: elementAsset,
                                schema: schema.name,
                                version: schema.version
                            }
                        }];
            }
        });
    });
}
exports._makeSellOrder = _makeSellOrder;
function getOrderHash(web3, exchangeHelper, order) {
    return __awaiter(this, void 0, void 0, function () {
        var orderParamValueArray, orderHash, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    orderParamValueArray = helper_1.orderParamsEncode(order);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, exchangeHelper.methods.hashOrder(orderParamValueArray).call()];
                case 2:
                    orderHash = _a.sent();
                    return [2 /*return*/, orderHash];
                case 3:
                    e_1 = _a.sent();
                    throw new error_1.ElementError({ code: '1000', message: 'exchangeHelper.methods.hashOrder ' + e_1.message });
                case 4: return [2 /*return*/];
            }
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
                    // const orderHash = hashOrder(web3, order)
                ];
                case 1:
                    orderHash = _a.sent();
                    hashedOrder = __assign(__assign({}, order), { hash: orderHash });
                    return [4 /*yield*/, signOrderHash(web3, hashedOrder).catch(function (error) {
                            throw error;
                        })];
                case 2:
                    signature = _a.sent();
                    orderWithSignature = __assign(__assign({}, hashedOrder), signature);
                    return [4 /*yield*/, check_1.validateOrder(exchangeHelper, orderWithSignature)];
                case 3:
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
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, helper_1.web3Sign(web3, hashedOrder.hash, hashedOrder.maker)];
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
                    error_2 = _a.sent();
                    throw error_2;
                case 3: return [2 /*return*/, signature];
            }
        });
    });
}
exports.signOrderHash = signOrderHash;
var orderToJSON = function (order) {
    var _a;
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
        englishAuctionReservePrice: (_a = order === null || order === void 0 ? void 0 : order.englishAuctionReservePrice) === null || _a === void 0 ? void 0 : _a.toString(),
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
    var schemaDefine = helper_1.getSchemaList(network, schema);
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
//计算当前 订单的总价格
function getCurrentPrice(exchangeHelper, order) {
    var _a, _b, _c, _d, _e, _f;
    return __awaiter(this, void 0, void 0, function () {
        var currentPrice;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0: return [4 /*yield*/, exchangeHelper.methods
                        .calculateFinalPrice((_a = order.side) === null || _a === void 0 ? void 0 : _a.toString(), (_b = order.saleKind) === null || _b === void 0 ? void 0 : _b.toString(), (_c = order.basePrice) === null || _c === void 0 ? void 0 : _c.toString(), (_d = order.extra) === null || _d === void 0 ? void 0 : _d.toString(), (_e = order.listingTime) === null || _e === void 0 ? void 0 : _e.toString(), (_f = order.expirationTime) === null || _f === void 0 ? void 0 : _f.toString())
                        .call()];
                case 1:
                    currentPrice = _g.sent();
                    return [2 /*return*/, currentPrice];
            }
        });
    });
}
exports.getCurrentPrice = getCurrentPrice;
function _getStaticCallTargetAndExtraData(_a) {
    var networkName = _a.networkName, asset = _a.asset, useTxnOriginStaticCall = _a.useTxnOriginStaticCall;
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_b) {
            if (useTxnOriginStaticCall) {
                return [2 /*return*/, {
                        staticTarget: constants_1.CONTRACTS_ADDRESSES[networkName].ElementixExchangeKeeper,
                        staticExtradata: constants_1.STATIC_EXTRADATA
                    }];
            }
            else {
                return [2 /*return*/, {
                        staticTarget: constants_1.NULL_ADDRESS,
                        staticExtradata: '0x'
                    }];
            }
            return [2 /*return*/];
        });
    });
}
exports._getStaticCallTargetAndExtraData = _getStaticCallTargetAndExtraData;
var computeOrderParams = function (order, networkName, assetRecipientAddress) {
    if ('asset' in order.metadata) {
        var schema = getSchema(networkName, order.metadata.schema);
        // TODO order.metadata.asset.data = ''
        var asset = order.metadata.asset;
        // if (!asset.data) {
        //   asset = { ...asset, data: '' }
        // }
        return order.side == types_1.OrderSide.Buy
            ? schema_1.encodeSell(schema, asset, assetRecipientAddress)
            : schema_1.encodeBuy(schema, asset, assetRecipientAddress);
    }
    else {
        throw new Error('Invalid order metadata');
    }
};
exports.computeOrderParams = computeOrderParams;
var computeOrderCallData = function (order, networkName, assetRecipientAddress) {
    if ('asset' in order.metadata) {
        var schema = getSchema(networkName, order.metadata.schema);
        var asset = order.metadata.asset;
        return order.side == types_1.OrderSide.Buy
            ? schema_1.encodeBuy(schema, asset, assetRecipientAddress)
            : schema_1.encodeSell(schema, asset, assetRecipientAddress);
    }
    else {
        throw new Error('Invalid order metadata');
    }
};
exports.computeOrderCallData = computeOrderCallData;
function _makeMatchingOrder(_a) {
    var networkName = _a.networkName, unSignedOrder = _a.unSignedOrder, accountAddress = _a.accountAddress, assetRecipientAddress = _a.assetRecipientAddress, feeRecipientAddress = _a.feeRecipientAddress;
    var order = unSignedOrder;
    var _b = exports.computeOrderParams(order, networkName, assetRecipientAddress), target = _b.target, dataToCall = _b.dataToCall, replacementPattern = _b.replacementPattern;
    var times = getTimeParameters(0);
    // Compat for matching buy orders that have fee recipient still on them
    var feeRecipient = order.feeRecipient == constants_1.NULL_ADDRESS ? feeRecipientAddress : constants_1.NULL_ADDRESS;
    var matchingOrder = {
        exchange: order.exchange,
        maker: accountAddress,
        taker: order.maker,
        quantity: order.quantity,
        makerRelayerFee: order.makerRelayerFee,
        takerRelayerFee: order.takerRelayerFee,
        makerProtocolFee: order.makerProtocolFee,
        takerProtocolFee: order.takerProtocolFee,
        makerReferrerFee: order.makerReferrerFee,
        waitingForBestCounterOrder: false,
        feeMethod: order.feeMethod,
        feeRecipient: feeRecipient,
        side: (order.side + 1) % 2,
        saleKind: types_1.SaleKind.FixedPrice,
        target: target,
        howToCall: order.howToCall,
        dataToCall: dataToCall,
        replacementPattern: replacementPattern,
        staticTarget: constants_1.NULL_ADDRESS,
        staticExtradata: '0x',
        paymentToken: order.paymentToken,
        basePrice: order.basePrice,
        extra: helper_1.makeBigNumber(0),
        listingTime: times.listingTime,
        expirationTime: times.expirationTime,
        salt: generatePseudoRandomSalt(),
        metadata: order.metadata
    };
    return matchingOrder;
}
exports._makeMatchingOrder = _makeMatchingOrder;
/**
 * Assign an order and a new matching order to their buy/sell sides
 * @param order Original order
 * @param matchingOrder The result of _makeMatchingOrder
 */
function assignOrdersToSides(order, matchingOrder) {
    var isSellOrder = order.side == types_1.OrderSide.Sell;
    var buy;
    var sell;
    if (!isSellOrder) {
        buy = order;
        sell = __assign(__assign({}, matchingOrder), { v: buy.v, r: buy.r, s: buy.s });
    }
    else {
        sell = order;
        buy = __assign(__assign({}, matchingOrder), { v: sell.v, r: sell.r, s: sell.s });
    }
    return { buy: buy, sell: sell };
}
exports.assignOrdersToSides = assignOrdersToSides;
