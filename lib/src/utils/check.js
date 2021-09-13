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
exports.getElementAssetURI = exports.checkAssetBalance = exports.checkAssetApprove = exports.checkAssetAddress = exports.checkAssetMint = exports.checkOrderCancelledOrFinalized = exports.getOrderCancelledOrFinalized = exports.ordersCanMatch = exports._ordersCanMatch = exports.validateOrder = exports.checkDataToCall = exports.checkMatchOrder = exports.checkOrder = exports.checkUnhashedOrder = exports.checkApproveSchemaProxy = exports.checkApproveERC721TransferProxy = exports.checkApproveERC1155TransferProxy = exports.checkApproveTokenTransferProxy = exports.checkRegisterProxy = exports.checkSenderOfAuthenticatedProxy = void 0;
var schema_1 = require("../schema");
var constants_1 = require("./constants");
var types_1 = require("../types");
var error_1 = require("../base/error");
var helper_1 = require("./helper");
var makeOrder_1 = require("./makeOrder");
var log = console.log;
// 检查交易合约，用户授权合约，代理合约 是否授权正确
function checkSenderOfAuthenticatedProxy(exchangeContract, authenticatedProxyContract, proxyRegistryContract, account) {
    return __awaiter(this, void 0, void 0, function () {
        var proxy, authProxyContract, user, authproxyRegistryAddr, exchangeProxyRegistryAddr, isPass;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, proxyRegistryContract.methods.proxies(account).call()];
                case 1:
                    proxy = _a.sent();
                    if (proxy == constants_1.NULL_ADDRESS) {
                        throw new error_1.ElementError({ code: '1001' });
                    }
                    authProxyContract = authenticatedProxyContract.clone();
                    authProxyContract.options.address = proxy;
                    return [4 /*yield*/, authProxyContract.methods.user().call()];
                case 2:
                    user = _a.sent();
                    if (user.toLowerCase() != account) {
                        throw new error_1.ElementError({ code: '1001' });
                    }
                    return [4 /*yield*/, authProxyContract.methods.registry().call()
                        // 交易合约授权的 orderMatch 执行合约地址
                    ];
                case 3:
                    authproxyRegistryAddr = _a.sent();
                    return [4 /*yield*/, exchangeContract.methods.registry().call()
                        // 用户代理合约授权合约 和 和交易代理授权合约是否一致
                    ];
                case 4:
                    exchangeProxyRegistryAddr = _a.sent();
                    // 用户代理合约授权合约 和 和交易代理授权合约是否一致
                    if (authproxyRegistryAddr.toLowerCase() != exchangeProxyRegistryAddr.toLowerCase()) {
                        throw new error_1.ElementError({ code: '1002' });
                    }
                    // 用户交易的代理注册合约 和 代理注册合约是否一致
                    if (authproxyRegistryAddr.toLowerCase() != proxyRegistryContract.options.address.toLowerCase()) {
                        throw new error_1.ElementError({ code: '1002' });
                    }
                    return [4 /*yield*/, proxyRegistryContract.methods.contracts(exchangeContract.options.address).call()];
                case 5:
                    isPass = _a.sent();
                    if (!isPass) {
                        throw new error_1.ElementError({ code: '1002' });
                    }
                    return [2 /*return*/, true];
            }
        });
    });
}
exports.checkSenderOfAuthenticatedProxy = checkSenderOfAuthenticatedProxy;
//1. check register
function checkRegisterProxy(proxyRegistryContract, account) {
    return __awaiter(this, void 0, void 0, function () {
        var proxy;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, proxyRegistryContract.methods.proxies(account).call()];
                case 1:
                    proxy = _a.sent();
                    if (proxy === constants_1.NULL_ADDRESS) {
                        throw new error_1.ElementError({ code: '1001' });
                    }
                    return [2 /*return*/, true];
            }
        });
    });
}
exports.checkRegisterProxy = checkRegisterProxy;
//2 check approve pay token
function checkApproveTokenTransferProxy(exchangeContract, erc20Contract, account) {
    return __awaiter(this, void 0, void 0, function () {
        var tokenTransferProxyAddr, allowAmount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, exchangeContract.methods.tokenTransferProxy().call()];
                case 1:
                    tokenTransferProxyAddr = _a.sent();
                    return [4 /*yield*/, erc20Contract.methods.allowance(account, tokenTransferProxyAddr).call()];
                case 2:
                    allowAmount = _a.sent();
                    if (new constants_1.BigNumber(allowAmount).eq(0)) {
                        throw new error_1.ElementError({ code: '1101', data: { erc20Address: erc20Contract.options.address } });
                    }
                    return [2 /*return*/, true];
            }
        });
    });
}
exports.checkApproveTokenTransferProxy = checkApproveTokenTransferProxy;
function checkApproveERC1155TransferProxy(proxyRegistryContract, nftsContract, account) {
    return __awaiter(this, void 0, void 0, function () {
        var operator, isApprove;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, proxyRegistryContract.methods.proxies(account).call()];
                case 1:
                    operator = _a.sent();
                    return [4 /*yield*/, nftsContract.methods.isApprovedForAll(account, operator).call()];
                case 2:
                    isApprove = _a.sent();
                    if (!isApprove) {
                        throw new error_1.ElementError({ code: '1102', data: { nftAddress: nftsContract.options.address } });
                    }
                    return [2 /*return*/, isApprove];
            }
        });
    });
}
exports.checkApproveERC1155TransferProxy = checkApproveERC1155TransferProxy;
function checkApproveERC721TransferProxy(proxyRegistryContract, nftsContract, account, tokenID) {
    return __awaiter(this, void 0, void 0, function () {
        var operator, isApprove;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, proxyRegistryContract.methods.proxies(account).call()];
                case 1:
                    operator = _a.sent();
                    return [4 /*yield*/, nftsContract.methods.isApprovedForAll(account, operator).call()];
                case 2:
                    isApprove = _a.sent();
                    if (!isApprove) {
                        throw new error_1.ElementError({ code: '1106', data: { nftAddress: nftsContract.options.address, tokenId: tokenID } });
                    }
                    return [2 /*return*/, true];
            }
        });
    });
}
exports.checkApproveERC721TransferProxy = checkApproveERC721TransferProxy;
function checkApproveSchemaProxy(contract, orderMetadata, account) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var operator, schemas, schema, asset, elementAsset, isApprove, callData, res, params;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, contract.exchangeProxyRegistry.methods.proxies(account).call()];
                case 1:
                    operator = _b.sent();
                    schemas = helper_1.getSchemaList(contract.networkName, orderMetadata.schema);
                    schema = schemas[0];
                    asset = {
                        tokenId: orderMetadata.asset.id,
                        tokenAddress: orderMetadata.asset.address,
                        schemaName: orderMetadata.schema
                    };
                    elementAsset = makeOrder_1.getElementAsset(schema, asset);
                    isApprove = (_a = schema === null || schema === void 0 ? void 0 : schema.functions) === null || _a === void 0 ? void 0 : _a.isApprove(elementAsset);
                    callData = schema_1.encodeCall(isApprove, [asset.tokenId]);
                    return [4 /*yield*/, contract.web3.eth.call({
                            to: schema.address,
                            data: callData
                        })];
                case 2:
                    res = _b.sent();
                    params = contract.web3.eth.abi.decodeParameters(isApprove.outputs, res);
                    // console.log('checkApproveSchemaProxy', res, '\n', params)
                    // let approveAddr = await nftsContract.methods.kittyIndexToApproved(tokenID).call()
                    if (params[0] !== operator) {
                        throw new error_1.ElementError({ code: '1108', context: { schemaName: asset.schemaName, tokenId: asset.tokenId } });
                    }
                    return [2 /*return*/, true];
            }
        });
    });
}
exports.checkApproveSchemaProxy = checkApproveSchemaProxy;
function checkUnhashedOrder(contract, order) {
    return __awaiter(this, void 0, void 0, function () {
        var erc20Contract, metadata, sell, buy, assetAddress, erc20Bal, ethBal, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 13, , 14]);
                    checkAssetAddress(contract.networkName, order);
                    erc20Contract = contract.erc20.clone();
                    metadata = order.metadata;
                    if (!(order.side == types_1.OrderSide.Sell)) return [3 /*break*/, 5];
                    sell = order;
                    return [4 /*yield*/, checkRegisterProxy(contract.exchangeProxyRegistry, order.maker)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, checkAssetApprove(contract, sell)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, checkAssetBalance(contract, sell)
                        //transfer fee
                    ];
                case 3:
                    _a.sent();
                    if (!(sell.paymentToken != constants_1.NULL_ADDRESS)) return [3 /*break*/, 5];
                    erc20Contract.options.address = sell.paymentToken;
                    return [4 /*yield*/, checkApproveTokenTransferProxy(contract.exchange, erc20Contract, sell.maker)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    if (!(order.side == types_1.OrderSide.Buy)) return [3 /*break*/, 12];
                    buy = order;
                    assetAddress = getAssetInfo(metadata).assetAddress;
                    if (!(assetAddress != contract.elementSharedAssetAddr)) return [3 /*break*/, 7];
                    return [4 /*yield*/, checkAssetMint(contract, metadata)];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7:
                    if (!(buy.paymentToken !== constants_1.NULL_ADDRESS)) return [3 /*break*/, 10];
                    erc20Contract.options.address = buy.paymentToken;
                    return [4 /*yield*/, helper_1.getAccountBalance(contract.web3, buy.maker, erc20Contract)];
                case 8:
                    erc20Bal = (_a.sent()).erc20Bal;
                    if (helper_1.makeBigNumber(erc20Bal).lt(buy.basePrice))
                        throw new error_1.ElementError({ code: '1104', context: { assetType: 'ERC20' } });
                    return [4 /*yield*/, checkApproveTokenTransferProxy(contract.exchange, erc20Contract, buy.maker)];
                case 9:
                    _a.sent();
                    return [3 /*break*/, 12];
                case 10: return [4 /*yield*/, helper_1.getAccountBalance(contract.web3, buy.maker)];
                case 11:
                    ethBal = (_a.sent()).ethBal;
                    if (helper_1.makeBigNumber(ethBal).lt(buy.basePrice))
                        throw new error_1.ElementError({ code: '1104', context: { assetType: 'ETH' } });
                    _a.label = 12;
                case 12:
                    checkDataToCall(contract.networkName, order);
                    return [3 /*break*/, 14];
                case 13:
                    error_2 = _a.sent();
                    if (error_2.data) {
                        error_2.data.order = order;
                    }
                    else {
                        // eslint-disable-next-line no-ex-assign
                        error_2 = __assign(__assign({}, error_2), { message: error_2.message, data: { order: order } });
                    }
                    throw error_2;
                case 14: return [2 /*return*/, true];
            }
        });
    });
}
exports.checkUnhashedOrder = checkUnhashedOrder;
// 检查签名订单是否正确
function checkOrder(contract, order) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // 检查订单授权，资产余额
                return [4 /*yield*/, checkUnhashedOrder(contract, order)
                    // 检查订单是否被取消
                ];
                case 1:
                    // 检查订单授权，资产余额
                    _a.sent();
                    // 检查订单是否被取消
                    return [4 /*yield*/, checkOrderCancelledOrFinalized(contract, order)
                        // 主要是检查Hash是否正确
                    ];
                case 2:
                    // 检查订单是否被取消
                    _a.sent();
                    // 主要是检查Hash是否正确
                    return [4 /*yield*/, validateOrder(contract.exchangeHelper, order)];
                case 3:
                    // 主要是检查Hash是否正确
                    _a.sent();
                    return [2 /*return*/, true];
            }
        });
    });
}
exports.checkOrder = checkOrder;
function checkMatchOrder(contract, buy, sell) {
    return __awaiter(this, void 0, void 0, function () {
        var equalPrice;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    equalPrice = sell.basePrice.gte(buy.basePrice);
                    if (!equalPrice) {
                        throw new error_1.ElementError({ code: '1201' });
                    }
                    // 检查对手单是否满足撮合条件
                    if (!_ordersCanMatch(buy, sell)) {
                        throw new error_1.ElementError({ code: '1202' });
                    }
                    if (!(sell.feeRecipient != constants_1.NULL_ADDRESS)) return [3 /*break*/, 3];
                    /* Assert taker fee is less than or equal to maximum fee specified by buyer. */
                    if (!sell.takerRelayerFee.lte(buy.takerRelayerFee)) {
                        throw new error_1.ElementError({
                            code: '1000',
                            message: "sell.takerRelayerFee " + sell.takerRelayerFee + " <= buy.takerRelayerFee " + buy.takerRelayerFee
                        });
                    }
                    return [4 /*yield*/, checkUnhashedOrder(contract, buy)
                        // 检查数据库的卖单
                    ]; //检查 买单用户token的授权情况
                case 1:
                    _a.sent(); //检查 买单用户token的授权情况
                    // 检查数据库的卖单
                    return [4 /*yield*/, checkOrder(contract, sell)];
                case 2:
                    // 检查数据库的卖单
                    _a.sent();
                    return [3 /*break*/, 6];
                case 3:
                    /* Assert taker fee is less than or equal to maximum fee specified by seller. */
                    if (!buy.takerRelayerFee.lte(sell.takerRelayerFee)) {
                        throw new error_1.ElementError({
                            code: '1000',
                            message: "buy.takerRelayerFee " + buy.takerRelayerFee + " <= sell.takerRelayerFee " + sell.takerRelayerFee
                        });
                    }
                    return [4 /*yield*/, checkUnhashedOrder(contract, sell)
                        // 检查数据库的买单
                    ]; // 检查 sell fee 是否授权
                case 4:
                    _a.sent(); // 检查 sell fee 是否授权
                    // 检查数据库的买单
                    return [4 /*yield*/, checkOrder(contract, buy)];
                case 5:
                    // 检查数据库的买单
                    _a.sent();
                    _a.label = 6;
                case 6: return [2 /*return*/, true];
            }
        });
    });
}
exports.checkMatchOrder = checkMatchOrder;
function checkDataToCall(netWorkName, order) {
    var schemas = helper_1.getSchemaList(netWorkName, order.metadata.schema);
    // TODO data sell.metadata.asset
    var asset = order.metadata.asset;
    if (!asset.data && asset.schemaName === types_1.ElementSchemaName.ERC1155) {
        asset = __assign(__assign({}, asset), { data: '' });
    }
    var encodeData;
    if (order.side == types_1.OrderSide.Sell) {
        encodeData = schema_1.encodeSell(schemas[0], asset, order.maker);
    }
    else {
        encodeData = schema_1.encodeBuy(schemas[0], asset, order.maker);
    }
    if (encodeData.dataToCall != order.dataToCall) {
        log('checkDataToCall.dataToCall error');
        log('now:', encodeData.dataToCall);
        log('order:', order.dataToCall);
        throw new error_1.ElementError({ code: '1208', context: { part: 'dataToCall' } });
    }
    if (encodeData.target != order.target) {
        log('checkDataToCall.target error');
        throw new error_1.ElementError({ code: '1208', context: { part: 'target' } });
    }
    if (encodeData.replacementPattern != order.replacementPattern) {
        throw new error_1.ElementError({ code: '1208', context: { part: 'replacementPattern' } });
    }
}
exports.checkDataToCall = checkDataToCall;
function validateOrder(exchangeHelper, order) {
    return __awaiter(this, void 0, void 0, function () {
        var orderParamValueArray, orderSigArray, isValidate, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    orderParamValueArray = helper_1.orderParamsEncode(order);
                    orderSigArray = helper_1.orderSigEncode(order);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, exchangeHelper.methods.validateOrder(orderParamValueArray, orderSigArray).call()];
                case 2:
                    isValidate = _a.sent();
                    if (!isValidate) {
                        log('validateOrder', orderParamValueArray);
                        throw new error_1.ElementError({ code: '1203' });
                    }
                    return [2 /*return*/, isValidate];
                case 3:
                    e_1 = _a.sent();
                    if (!e_1.code) {
                        throw new error_1.ElementError({ code: '1205' });
                    }
                    throw e_1;
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.validateOrder = validateOrder;
// export function validateAndFormatWalletAddress(web3: any, address: string): string {
//   if (!address) {
//     throw new Error('No wallet address found')
//   }
//   if (!web3.utils.isAddress(address)) {
//     throw new Error('Invalid wallet address')
//   }
//   if (address === NULL_ADDRESS) {
//     throw new Error('Wallet cannot be the null address')
//   }
//   return address.toLowerCase()
// }
var canSettleOrder = function (listingTime, expirationTime) {
    var now = Math.round(Date.now() / 1000);
    if (constants_1.BigNumber.isBigNumber(listingTime)) {
        listingTime = listingTime.toNumber();
    }
    else {
        listingTime = Number(listingTime);
    }
    if (constants_1.BigNumber.isBigNumber(expirationTime)) {
        expirationTime = expirationTime.toNumber();
    }
    else {
        expirationTime = Number(expirationTime);
    }
    var canSettle = listingTime <= now && (expirationTime == 0 || now < expirationTime);
    //  log(`canSettleOrder ${canSettle} ${listingTime} <  now: ${now} < ${expirationTime} `)
    return canSettle;
};
function _ordersCanMatch(buy, sell) {
    var errorLog = function (msg) {
        log('_ordersCanMatch false ', msg);
        return false;
    };
    return ((buy.side == 0 || errorLog('buy.side')) &&
        (sell.side == 1 || errorLog('sell.side')) &&
        /* Must use same fee method. */
        (buy.feeMethod == sell.feeMethod || errorLog('feeMethod !=')) &&
        /* Must use same payment token. */
        (buy.paymentToken == sell.paymentToken || errorLog('paymentToken !=')) &&
        /* Must match maker/taker addresses. */
        (sell.taker == constants_1.NULL_ADDRESS || sell.taker == buy.maker || errorLog('sell.taker != buy.maker')) &&
        (buy.taker == constants_1.NULL_ADDRESS || buy.taker == sell.maker || errorLog('buy.taker != sell.maker')) &&
        /* One must be maker and the other must be taker (no bool XOR in Solidity). */
        ((sell.feeRecipient == constants_1.NULL_ADDRESS && buy.feeRecipient != constants_1.NULL_ADDRESS) ||
            (sell.feeRecipient != constants_1.NULL_ADDRESS && buy.feeRecipient == constants_1.NULL_ADDRESS)) &&
        /* Must match target. */
        (buy.target == sell.target || errorLog('target != ')) &&
        /* Must match howToCall. */
        (buy.howToCall == sell.howToCall || errorLog('howToCall != ')) &&
        /* Buy-side order must be settleable. */
        (canSettleOrder(buy.listingTime, buy.expirationTime) || errorLog("buy.expirationTime != ")) &&
        /* Sell-side order must be settleable. */
        (canSettleOrder(sell.listingTime, sell.expirationTime) || errorLog("sell.expirationTime != ")));
}
exports._ordersCanMatch = _ordersCanMatch;
function ordersCanMatch(exchangeHelper, buy, sell) {
    return __awaiter(this, void 0, void 0, function () {
        var buyOrderParamArray, sellOrderParamArray, canMatch;
        return __generator(this, function (_a) {
            buyOrderParamArray = helper_1.orderParamsEncode(buy);
            sellOrderParamArray = helper_1.orderParamsEncode(sell);
            canMatch = exchangeHelper.methods.ordersCanMatch(buyOrderParamArray, sellOrderParamArray).call();
            if (!canMatch) {
                throw new error_1.ElementError({ code: '1202' });
            }
            return [2 /*return*/, true];
        });
    });
}
exports.ordersCanMatch = ordersCanMatch;
function getOrderCancelledOrFinalized(contract, order) {
    return __awaiter(this, void 0, void 0, function () {
        var orderParamValueArray, hash;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    orderParamValueArray = helper_1.orderParamsEncode(order);
                    return [4 /*yield*/, contract.exchangeHelper.methods.hashToSign(orderParamValueArray).call()];
                case 1:
                    hash = _a.sent();
                    return [2 /*return*/, contract.exchange.methods.cancelledOrFinalized(hash).call()];
            }
        });
    });
}
exports.getOrderCancelledOrFinalized = getOrderCancelledOrFinalized;
// 是否取消或者完成
function checkOrderCancelledOrFinalized(contract, order) {
    return __awaiter(this, void 0, void 0, function () {
        var iscancelledOrFinalized;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getOrderCancelledOrFinalized(contract, order)];
                case 1:
                    iscancelledOrFinalized = _a.sent();
                    if (iscancelledOrFinalized) {
                        if (order.side === types_1.OrderSide.Sell) {
                            throw new error_1.ElementError({ code: '1207', context: { orderSide: 'Sell' } });
                        }
                        else {
                            throw new error_1.ElementError({ code: '1207', context: { orderSide: 'Buy' } });
                        }
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.checkOrderCancelledOrFinalized = checkOrderCancelledOrFinalized;
function getAssetInfo(metadata) {
    var tokenId;
    var assetAddress;
    if (metadata.asset.id && metadata.asset.address) {
        tokenId = metadata.asset.id;
        assetAddress = metadata.asset.address.toLowerCase();
    }
    else {
        throw new error_1.ElementError({
            message: 'sell.metadata.asset.id or address undefined',
            code: '1000'
        });
    }
    return { tokenId: tokenId, assetAddress: assetAddress };
}
function checkAssetMint(contract, metadata) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function () {
        var _c, tokenId, assetAddress, exists;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _c = getAssetInfo(metadata), tokenId = _c.tokenId, assetAddress = _c.assetAddress;
                    if (!(assetAddress == ((_a = contract.elementSharedAssetV1) === null || _a === void 0 ? void 0 : _a.options.address.toLowerCase()))) return [3 /*break*/, 2];
                    return [4 /*yield*/, ((_b = contract.elementSharedAssetV1) === null || _b === void 0 ? void 0 : _b.methods.exists(tokenId).call())];
                case 1:
                    exists = _d.sent();
                    if (!exists) {
                        throw new error_1.ElementError({
                            message: 'elementSharedAssetV1 asset not exists',
                            code: '1000'
                        });
                    }
                    _d.label = 2;
                case 2: return [2 /*return*/, true];
            }
        });
    });
}
exports.checkAssetMint = checkAssetMint;
function checkAssetAddress(netWorkName, order) {
    return __awaiter(this, void 0, void 0, function () {
        var schemas, metadata, assetAddress;
        return __generator(this, function (_a) {
            schemas = helper_1.getSchemaList(netWorkName, order.metadata.schema);
            metadata = order.metadata;
            assetAddress = getAssetInfo(metadata).assetAddress;
            if (schemas.length === 0) {
                throw new error_1.ElementError({ code: '1206', context: { assetType: metadata.schema } });
            }
            if (schemas[0].name === types_1.ElementSchemaName.CryptoKitties) {
                if (schemas[0].address !== assetAddress) {
                    throw new error_1.ElementError({ code: '1209', context: { assetType: metadata.schema, address: assetAddress } });
                }
            }
            return [2 /*return*/];
        });
    });
}
exports.checkAssetAddress = checkAssetAddress;
function checkAssetApprove(contract, order) {
    return __awaiter(this, void 0, void 0, function () {
        var sell, checkAddr, metadata, _a, tokenId, assetAddress, sellNFTs, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    sell = order;
                    checkAddr = sell.maker;
                    metadata = sell.metadata;
                    _a = getAssetInfo(metadata), tokenId = _a.tokenId, assetAddress = _a.assetAddress;
                    sellNFTs = contract.erc20.clone();
                    _b = metadata.schema;
                    switch (_b) {
                        case types_1.ElementSchemaName.ERC20: return [3 /*break*/, 1];
                        case types_1.ElementSchemaName.ERC721: return [3 /*break*/, 2];
                        case types_1.ElementSchemaName.ERC1155: return [3 /*break*/, 4];
                    }
                    return [3 /*break*/, 8];
                case 1:
                    sellNFTs = contract.erc20.clone();
                    sellNFTs.options.address = assetAddress;
                    return [3 /*break*/, 10];
                case 2:
                    sellNFTs = contract.erc721.clone();
                    sellNFTs.options.address = assetAddress;
                    return [4 /*yield*/, checkApproveERC721TransferProxy(contract.exchangeProxyRegistry, sellNFTs, checkAddr, tokenId)];
                case 3:
                    _c.sent();
                    return [3 /*break*/, 10];
                case 4:
                    sellNFTs = contract.erc1155.clone();
                    sellNFTs.options.address = assetAddress;
                    if (!(assetAddress != contract.elementSharedAssetAddr)) return [3 /*break*/, 6];
                    return [4 /*yield*/, checkAssetMint(contract, metadata)];
                case 5:
                    _c.sent();
                    _c.label = 6;
                case 6: return [4 /*yield*/, checkApproveERC1155TransferProxy(contract.exchangeProxyRegistry, sellNFTs, checkAddr)];
                case 7:
                    _c.sent();
                    return [3 /*break*/, 10];
                case 8: return [4 /*yield*/, checkApproveSchemaProxy(contract, metadata, checkAddr)
                    // throw new ElementError({code: '1206', context: {assetType: metadata.schema}})
                ];
                case 9:
                    _c.sent();
                    // throw new ElementError({code: '1206', context: {assetType: metadata.schema}})
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/, sellNFTs];
            }
        });
    });
}
exports.checkAssetApprove = checkAssetApprove;
function checkAssetBalance(contract, order) {
    return __awaiter(this, void 0, void 0, function () {
        var checkAddr, metadata, _a, tokenId, assetAddress, sellNFTs, balance, _b, owner, kittiyOwner;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    checkAddr = order.maker.toLowerCase();
                    metadata = order.metadata;
                    _a = getAssetInfo(metadata), tokenId = _a.tokenId, assetAddress = _a.assetAddress;
                    sellNFTs = contract.erc20.clone();
                    balance = 0;
                    _b = metadata.schema;
                    switch (_b) {
                        case types_1.ElementSchemaName.ERC20: return [3 /*break*/, 1];
                        case types_1.ElementSchemaName.ERC721: return [3 /*break*/, 2];
                        case types_1.ElementSchemaName.CryptoKitties: return [3 /*break*/, 4];
                        case types_1.ElementSchemaName.ERC1155: return [3 /*break*/, 6];
                    }
                    return [3 /*break*/, 8];
                case 1:
                    sellNFTs = contract.erc20.clone();
                    sellNFTs.options.address = assetAddress;
                    return [3 /*break*/, 9];
                case 2:
                    sellNFTs = contract.erc721.clone();
                    sellNFTs.options.address = assetAddress;
                    return [4 /*yield*/, sellNFTs.methods.ownerOf(tokenId).call()];
                case 3:
                    owner = _c.sent();
                    if (owner.toLowerCase() !== checkAddr)
                        throw new error_1.ElementError({ code: '1103', context: { assetType: metadata.schema } });
                    balance = 1;
                    return [3 /*break*/, 9];
                case 4:
                    sellNFTs = contract.erc721.clone();
                    sellNFTs.options.address = assetAddress;
                    return [4 /*yield*/, sellNFTs.methods.ownerOf(tokenId).call()];
                case 5:
                    kittiyOwner = _c.sent();
                    if (kittiyOwner.toLowerCase() !== checkAddr)
                        throw new error_1.ElementError({ code: '1103', context: { assetType: metadata.schema } });
                    balance = 1;
                    return [3 /*break*/, 9];
                case 6:
                    sellNFTs = contract.erc1155.clone();
                    sellNFTs.options.address = assetAddress;
                    return [4 /*yield*/, sellNFTs.methods.balanceOf(checkAddr, tokenId).call()];
                case 7:
                    balance = _c.sent();
                    return [3 /*break*/, 9];
                case 8: throw new error_1.ElementError({ code: '1206', context: { assetType: metadata.schema } });
                case 9:
                    if (!constants_1.BigNumber.isBigNumber(order.quantity)) {
                        order.quantity = new constants_1.BigNumber(order.quantity);
                    }
                    if (order.quantity.gt(balance.toString())) {
                        throw new error_1.ElementError({ code: '1103', context: { assetType: metadata.schema } });
                    }
                    return [2 /*return*/, Number(balance)];
            }
        });
    });
}
exports.checkAssetBalance = checkAssetBalance;
// 获得ElementAssetStore tokenid对应的URI
var getElementAssetURI = function (contract, tokenId) { return __awaiter(void 0, void 0, void 0, function () {
    var overURI, URI;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, contract.elementSharedAsset.methods._getOverrideURI(tokenId).call()];
            case 1:
                overURI = _a.sent();
                return [4 /*yield*/, contract.elementSharedAsset.methods.uri(tokenId).call()];
            case 2:
                URI = _a.sent();
                return [2 /*return*/, { overURI: overURI, URI: URI }];
        }
    });
}); };
exports.getElementAssetURI = getElementAssetURI;
