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
exports.approveERC721TransferProxy = exports.approveERC1155TransferProxy = exports.approveTokenTransferProxy = exports.registerProxy = void 0;
var __1 = require("..");
var constants_1 = require("./constants");
//1.  register
function registerProxy(proxyRegistryContract, account) {
    return __awaiter(this, void 0, void 0, function () {
        var proxy, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, proxyRegistryContract.methods.proxies(account).call()];
                case 1:
                    proxy = _a.sent();
                    if (!(proxy === __1.NULL_ADDRESS)) return [3 /*break*/, 3];
                    return [4 /*yield*/, proxyRegistryContract.methods.registerProxy().send({
                            from: account
                        })];
                case 2:
                    res = _a.sent();
                    if (!res.status) {
                        throw new __1.ElementError({ code: '2001', message: 'registerProxy()' });
                    }
                    _a.label = 3;
                case 3: return [2 /*return*/, true];
            }
        });
    });
}
exports.registerProxy = registerProxy;
//2 approve pay token
function approveTokenTransferProxy(exchangeContract, erc20Contract, account) {
    return __awaiter(this, void 0, void 0, function () {
        var tokenTransferProxyAddr, allowAmount, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, exchangeContract.methods.tokenTransferProxy().call()];
                case 1:
                    tokenTransferProxyAddr = _a.sent();
                    return [4 /*yield*/, erc20Contract.methods.allowance(account, tokenTransferProxyAddr).call()];
                case 2:
                    allowAmount = _a.sent();
                    if (!new constants_1.BigNumber(allowAmount).eq(0)) return [3 /*break*/, 4];
                    return [4 /*yield*/, erc20Contract.methods.approve(tokenTransferProxyAddr, constants_1.MAX_UINT_256.toString()).send({
                            from: account
                        })];
                case 3:
                    res = _a.sent();
                    if (!res.status) {
                        throw new __1.ElementError({ code: '2001', message: 'tokenTransferProxyAddr approve()' });
                    }
                    _a.label = 4;
                case 4: return [2 /*return*/, true];
            }
        });
    });
}
exports.approveTokenTransferProxy = approveTokenTransferProxy;
//3  approve 1155 NFTs to proxy
function approveERC1155TransferProxy(proxyRegistryContract, nftsContract, account) {
    return __awaiter(this, void 0, void 0, function () {
        var operator, isApprove, operator_1, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, proxyRegistryContract.methods.proxies(account).call()];
                case 1:
                    operator = _a.sent();
                    return [4 /*yield*/, nftsContract.methods.isApprovedForAll(account, operator).call()];
                case 2:
                    isApprove = _a.sent();
                    if (!!isApprove) return [3 /*break*/, 5];
                    return [4 /*yield*/, proxyRegistryContract.methods.proxies(account).call()];
                case 3:
                    operator_1 = _a.sent();
                    return [4 /*yield*/, nftsContract.methods.setApprovalForAll(operator_1, true).send({ from: account })];
                case 4:
                    res = _a.sent();
                    if (!res.status) {
                        throw new __1.ElementError({ code: '2001', message: 'ERC1155 NFTs setApprovalForAll()' });
                    }
                    _a.label = 5;
                case 5: return [2 /*return*/, true];
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
                case 0: return [4 /*yield*/, proxyRegistryContract.methods.proxies(account).call()
                    //isApprovedForAll
                ];
                case 1:
                    operator = _a.sent();
                    return [4 /*yield*/, nftsContract.methods.isApprovedForAll(account, operator).call()];
                case 2:
                    isApprove = _a.sent();
                    if (!!isApprove) return [3 /*break*/, 4];
                    return [4 /*yield*/, nftsContract.methods.approve(operator, tokenID).send({ from: account })];
                case 3:
                    res = _a.sent();
                    if (!res.status) {
                        throw new __1.ElementError({ code: '2001', message: 'ERC721 NFTs approve()' });
                    }
                    _a.label = 4;
                case 4: return [2 /*return*/, true];
            }
        });
    });
}
exports.approveERC721TransferProxy = approveERC721TransferProxy;
