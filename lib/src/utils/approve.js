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
exports.approveSchemaProxy = exports.approveERC721TransferProxy = exports.approveERC1155TransferProxy = exports.approveTokenTransferProxy = exports.registerProxy = void 0;
var index_1 = require("../../index");
var constants_1 = require("./constants");
var makeOrder_1 = require("./makeOrder");
//1.  register
function registerProxy(_a) {
    var proxyRegistryContract = _a.proxyRegistryContract, account = _a.account, callBack = _a.callBack;
    return __awaiter(this, void 0, void 0, function () {
        var proxy, res;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, proxyRegistryContract.methods.proxies(account).call()];
                case 1:
                    proxy = _b.sent();
                    if (!(proxy === index_1.NULL_ADDRESS)) return [3 /*break*/, 3];
                    return [4 /*yield*/, proxyRegistryContract.methods
                            .registerProxy()
                            .send({
                            from: account
                        })
                            .on('transactionHash', function (txHash) {
                            callBack === null || callBack === void 0 ? void 0 : callBack.next(index_1.OrderCheckStatus.RegisterTxHash, { txHash: txHash });
                            console.log('registerProxy tx hash', txHash);
                        })
                            .on('receipt', function (receipt) {
                            callBack === null || callBack === void 0 ? void 0 : callBack.next(index_1.OrderCheckStatus.EndRegister, { receipt: receipt });
                            console.log('registerProxy tx receipt', receipt);
                        })
                            .catch(function (error) {
                            if (error.code == '4001') {
                                throw new index_1.ElementError(error);
                            }
                            else {
                                throw new index_1.ElementError({ code: '2001', context: { funcName: 'registerProxy()', msg: error.message } });
                            }
                        })];
                case 2:
                    res = _b.sent();
                    _b.label = 3;
                case 3: return [2 /*return*/, true];
            }
        });
    });
}
exports.registerProxy = registerProxy;
//2 approve pay token
function approveTokenTransferProxy(_a) {
    var exchangeContract = _a.exchangeContract, erc20Contract = _a.erc20Contract, account = _a.account, callBack = _a.callBack;
    return __awaiter(this, void 0, void 0, function () {
        var tokenTransferProxyAddr, allowAmount, res;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, exchangeContract.methods.tokenTransferProxy().call()];
                case 1:
                    tokenTransferProxyAddr = _b.sent();
                    return [4 /*yield*/, erc20Contract.methods.allowance(account, tokenTransferProxyAddr).call()];
                case 2:
                    allowAmount = _b.sent();
                    if (!new constants_1.BigNumber(allowAmount).eq(0)) return [3 /*break*/, 4];
                    return [4 /*yield*/, erc20Contract.methods
                            .approve(tokenTransferProxyAddr, constants_1.MAX_UINT_256.toString())
                            .send({
                            from: account
                        })
                            .on('transactionHash', function (txHash) {
                            callBack === null || callBack === void 0 ? void 0 : callBack.next(index_1.OrderCheckStatus.ApproveErc20TxHash, { txHash: txHash });
                            console.log('approveTokenTransferProxy tx txHash', txHash);
                        })
                            .on('receipt', function (receipt) {
                            callBack === null || callBack === void 0 ? void 0 : callBack.next(index_1.OrderCheckStatus.EndApproveErc20, { receipt: receipt });
                            console.log('approveTokenTransferProxy tx receipt', receipt);
                        })
                            .catch(function (error) {
                            if (error.code == '4001') {
                                throw error;
                            }
                            else {
                                throw new index_1.ElementError({ code: '2001', context: { funcName: 'Erc20 approveTokenTransferProxy()' } });
                            }
                        })];
                case 3:
                    res = _b.sent();
                    _b.label = 4;
                case 4: return [2 /*return*/, true];
            }
        });
    });
}
exports.approveTokenTransferProxy = approveTokenTransferProxy;
//3  approve 1155 NFTs to proxy
function approveERC1155TransferProxy(_a) {
    var proxyRegistryContract = _a.proxyRegistryContract, erc1155Contract = _a.erc1155Contract, account = _a.account, callBack = _a.callBack;
    return __awaiter(this, void 0, void 0, function () {
        var operator, isApprove, res;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, proxyRegistryContract.methods.proxies(account).call()];
                case 1:
                    operator = _b.sent();
                    return [4 /*yield*/, erc1155Contract.methods.isApprovedForAll(account, operator).call()];
                case 2:
                    isApprove = _b.sent();
                    if (!!isApprove) return [3 /*break*/, 4];
                    return [4 /*yield*/, erc1155Contract.methods
                            .setApprovalForAll(operator, true)
                            .send({ from: account })
                            .on('transactionHash', function (txHash) {
                            callBack === null || callBack === void 0 ? void 0 : callBack.next(index_1.OrderCheckStatus.ApproveErc1155TxHash, { txHash: txHash });
                            console.log('approveERC1155TransferProxy tx txHash', txHash);
                        })
                            .on('receipt', function (receipt) {
                            callBack === null || callBack === void 0 ? void 0 : callBack.next(index_1.OrderCheckStatus.EndApproveErc1155, { receipt: receipt });
                            console.log('approveERC1155TransferProxy tx receipt', receipt);
                        })
                            .catch(function (error) {
                            if (error.code == '4001') {
                                throw error;
                            }
                            else {
                                throw new index_1.ElementError({ code: '2001', context: { funcName: 'ERC1155 NFTs setApprovalForAll()' } });
                            }
                        })];
                case 3:
                    res = _b.sent();
                    _b.label = 4;
                case 4: return [2 /*return*/, true];
            }
        });
    });
}
exports.approveERC1155TransferProxy = approveERC1155TransferProxy;
//4  approve 721 NFTs to proxy
function approveERC721TransferProxy(_a) {
    var proxyRegistryContract = _a.proxyRegistryContract, erc721Contract = _a.erc721Contract, account = _a.account, tokenId = _a.tokenId, callBack = _a.callBack;
    return __awaiter(this, void 0, void 0, function () {
        var operator, isApprove, res;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, proxyRegistryContract.methods.proxies(account).call()
                    //isApprovedForAll
                ];
                case 1:
                    operator = _b.sent();
                    return [4 /*yield*/, erc721Contract.methods.isApprovedForAll(account, operator).call()];
                case 2:
                    isApprove = _b.sent();
                    if (!!isApprove) return [3 /*break*/, 4];
                    return [4 /*yield*/, erc721Contract.methods
                            .setApprovalForAll(operator, true)
                            .send({ from: account })
                            .on('transactionHash', function (txHash) {
                            callBack === null || callBack === void 0 ? void 0 : callBack.next(index_1.OrderCheckStatus.ApproveErc721TxHash, { txHash: txHash });
                            console.log('approveERC721TransferProxy tx txHash', txHash);
                        })
                            .on('receipt', function (receipt) {
                            callBack === null || callBack === void 0 ? void 0 : callBack.next(index_1.OrderCheckStatus.EndApproveErc721, { receipt: receipt });
                            console.log('approveERC721TransferProxy tx receipt', receipt);
                        })
                            .catch(function (error) {
                            if (error.code == '4001') {
                                throw error;
                            }
                            else {
                                throw new index_1.ElementError({ code: '2001', context: { funcName: 'ERC721 NFTs setApprovalForAll()' } });
                            }
                        })];
                case 3:
                    res = _b.sent();
                    _b.label = 4;
                case 4: return [2 /*return*/, true];
            }
        });
    });
}
exports.approveERC721TransferProxy = approveERC721TransferProxy;
function approveSchemaProxy(_a) {
    var _b;
    var contract = _a.contract, orderMetadata = _a.orderMetadata, callBack = _a.callBack;
    return __awaiter(this, void 0, void 0, function () {
        var account, operator, schemas, schema, asset, elementAsset, accountApprove, callData, estimateGas, transactionObject;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    account = contract.web3.eth.defaultAccount;
                    return [4 /*yield*/, contract.exchangeProxyRegistry.methods.proxies(account).call()];
                case 1:
                    operator = _c.sent();
                    schemas = index_1.getSchemaList(contract.networkName, orderMetadata.schema);
                    schema = schemas[0];
                    asset = {
                        tokenId: orderMetadata.asset.id,
                        tokenAddress: orderMetadata.asset.address,
                        schemaName: orderMetadata.schema
                    };
                    elementAsset = makeOrder_1.getElementAsset(schema, asset);
                    accountApprove = (_b = schema === null || schema === void 0 ? void 0 : schema.functions) === null || _b === void 0 ? void 0 : _b.approve(elementAsset, operator);
                    callData = index_1.encodeCall(accountApprove, [operator, asset.tokenId]);
                    return [4 /*yield*/, contract.web3.eth.estimateGas({ to: schema.address, data: callData })];
                case 2:
                    estimateGas = _c.sent();
                    transactionObject = {
                        from: account,
                        to: asset.tokenAddress,
                        value: 0,
                        gas: estimateGas,
                        data: callData
                    };
                    return [4 /*yield*/, contract.web3.eth
                            .sendTransaction(transactionObject)
                            .on('transactionHash', function (txHash) {
                            callBack === null || callBack === void 0 ? void 0 : callBack.next(index_1.OrderCheckStatus.ApproveErc721TxHash, { txHash: txHash });
                            console.log('approveSchemaProxy tx txHash', txHash);
                        })
                            .on('receipt', function (receipt) {
                            callBack === null || callBack === void 0 ? void 0 : callBack.next(index_1.OrderCheckStatus.EndApproveErc721, { receipt: receipt });
                            console.log('approveSchemaProxy tx receipt', receipt);
                        })
                            .catch(function (error) {
                            if (error.code == '4001') {
                                throw error;
                            }
                            else {
                                throw new index_1.ElementError({ code: '2001', context: { funcName: schema.name + " setApprovalForAll()" } });
                            }
                        })];
                case 3:
                    _c.sent();
                    return [2 /*return*/, true];
            }
        });
    });
}
exports.approveSchemaProxy = approveSchemaProxy;
