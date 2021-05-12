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
exports.approveERC721TransferProxy = exports.approveERC1155TransferProxy = exports.approveTokenTransferProxy = exports.registerProxy = exports.getTokenIDOwner = exports.getAccountNFTsBalance = exports.getAccountBalance = exports.checkSenderOfAuthenticatedProxy = void 0;
var index_1 = require("./index");
function checkSenderOfAuthenticatedProxy(exchange, authenticatedProxyContract, proxyRegistryContract, account) {
    return __awaiter(this, void 0, void 0, function () {
        var proxy, authProxyContract, user, authproxyRegistryAddr, exchangeProxyRegistryAddr;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, proxyRegistryContract.methods.proxies(account).call()];
                case 1:
                    proxy = _a.sent();
                    authProxyContract = authenticatedProxyContract.clone();
                    authProxyContract.options.address = proxy;
                    return [4 /*yield*/, authProxyContract.methods.user().call()];
                case 2:
                    user = _a.sent();
                    if (user != account) {
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, authProxyContract.methods.registry().call()];
                case 3:
                    authproxyRegistryAddr = _a.sent();
                    return [4 /*yield*/, exchange.methods.registry().call()];
                case 4:
                    exchangeProxyRegistryAddr = _a.sent();
                    if (authproxyRegistryAddr != exchangeProxyRegistryAddr) {
                        return [2 /*return*/, false];
                    }
                    if (authproxyRegistryAddr != proxyRegistryContract.options.address) {
                        return [2 /*return*/, false];
                    }
                    // 验证是否注册
                    return [2 /*return*/, proxyRegistryContract.methods.contracts(exchange.options.address).call()];
            }
        });
    });
}
exports.checkSenderOfAuthenticatedProxy = checkSenderOfAuthenticatedProxy;
function getAccountBalance(web3, account, erc20) {
    return __awaiter(this, void 0, void 0, function () {
        var ethBal, erc20Bal;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, web3.eth.getBalance(account)];
                case 1:
                    ethBal = _a.sent();
                    if (Number(ethBal) == 0) {
                        return [2 /*return*/, false];
                    }
                    erc20Bal = 0;
                    if (!erc20) return [3 /*break*/, 3];
                    return [4 /*yield*/, erc20.methods.balanceOf(account).call()];
                case 2:
                    erc20Bal = _a.sent();
                    if (Number(erc20Bal) == 0) {
                        return [2 /*return*/, false];
                    }
                    _a.label = 3;
                case 3: return [2 /*return*/, { ethBal: ethBal, erc20Bal: erc20Bal }];
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
            switch (_a.label) {
                case 0: return [4 /*yield*/, elementAssetContract.methods.creator(tokenId).call()];
                case 1: 
                // token id 的 creator
                // let exists = await elementAssetContract.methods.exists(tokenId).call()
                return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.getTokenIDOwner = getTokenIDOwner;
//1. check register
function registerProxy(proxyRegistryContract, account) {
    return __awaiter(this, void 0, void 0, function () {
        var proxy, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, proxyRegistryContract.methods.proxies(account).call()];
                case 1:
                    proxy = _a.sent();
                    if (!(proxy === index_1.NULL_ADDRESS)) return [3 /*break*/, 3];
                    return [4 /*yield*/, proxyRegistryContract.methods.registerProxy().send({
                            from: account
                        })];
                case 2:
                    res = _a.sent();
                    return [2 /*return*/, res.status];
                case 3: return [2 /*return*/, true];
            }
        });
    });
}
exports.registerProxy = registerProxy;
//2 approve pay token
function approveTokenTransferProxy(exchangeContract, erc20Contract, account) {
    return __awaiter(this, void 0, void 0, function () {
        var tokenTransferProxyAddr, amount, approveResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, exchangeContract.methods.tokenTransferProxy().call()];
                case 1:
                    tokenTransferProxyAddr = _a.sent();
                    return [4 /*yield*/, erc20Contract.methods.allowance(account, tokenTransferProxyAddr).call()];
                case 2:
                    amount = _a.sent();
                    if (!(Number(amount) <= 100e18)) return [3 /*break*/, 4];
                    return [4 /*yield*/, erc20Contract.methods.approve(tokenTransferProxyAddr, index_1.MAX_UINT_256).send({
                            from: account
                        })];
                case 3:
                    approveResult = _a.sent();
                    return [2 /*return*/, approveResult.status];
                case 4: return [2 /*return*/, true];
            }
        });
    });
}
exports.approveTokenTransferProxy = approveTokenTransferProxy;
//3  approve 1155 NFTs to proxy
function approveERC1155TransferProxy(proxyRegistryContract, nftsContract, account) {
    return __awaiter(this, void 0, void 0, function () {
        var operator, isApprove, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, proxyRegistryContract.methods.proxies(account).call()];
                case 1:
                    operator = _a.sent();
                    return [4 /*yield*/, nftsContract.methods.isApprovedForAll(account, operator).call()];
                case 2:
                    isApprove = _a.sent();
                    if (!!isApprove) return [3 /*break*/, 4];
                    return [4 /*yield*/, nftsContract.methods.setApprovalForAll(operator, true).send({ from: account })];
                case 3:
                    res = _a.sent();
                    return [2 /*return*/, res.status];
                case 4: return [2 /*return*/, isApprove];
            }
        });
    });
}
exports.approveERC1155TransferProxy = approveERC1155TransferProxy;
//4  approve 721 NFTs to proxy
function approveERC721TransferProxy(proxyRegistryContract, nftsContract, account, tokenID) {
    return __awaiter(this, void 0, void 0, function () {
        var operator, isApprove, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, proxyRegistryContract.methods.proxies(account).call()];
                case 1:
                    operator = _a.sent();
                    return [4 /*yield*/, nftsContract.methods.getApproved(tokenID).call()];
                case 2:
                    isApprove = _a.sent();
                    if (!!isApprove) return [3 /*break*/, 4];
                    return [4 /*yield*/, nftsContract.methods.approve(operator, tokenID).send({ from: account })];
                case 3:
                    res = _a.sent();
                    return [2 /*return*/, res.status];
                case 4: return [2 /*return*/, isApprove];
            }
        });
    });
}
exports.approveERC721TransferProxy = approveERC721TransferProxy;
