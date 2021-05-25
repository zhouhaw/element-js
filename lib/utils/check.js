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
exports.ordersCanMatch = exports._ordersCanMatch = exports.validateAndFormatWalletAddress = exports.validateOrder = exports.checkDataToCall = exports.checkOrder = exports.checkMatchOrder = exports.checkBuyUser = exports.checkSellUser = exports.approveERC721TransferProxy = exports.checkApproveERC721TransferProxy = exports.approveERC1155TransferProxy = exports.checkApproveERC1155TransferProxy = exports.approveTokenTransferProxy = exports.checkApproveTokenTransferProxy = exports.registerProxy = exports.checkRegisterProxy = exports.getTokenIDOwner = exports.getAccountNFTsBalance = exports.getAccountBalance = exports.checkSenderOfAuthenticatedProxy = void 0;
var markOrder_1 = require("./markOrder");
var schema_1 = require("../schema");
var constants_1 = require("./constants");
var types_1 = require("../types");
var error_1 = require("../base/error");
var log = console.log;
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
                    if (user != account) {
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
                    if (authproxyRegistryAddr != exchangeProxyRegistryAddr) {
                        throw new error_1.ElementError({ code: '1002' });
                    }
                    // 用户交易的代理注册合约 和 代理注册合约是否一致
                    if (authproxyRegistryAddr != proxyRegistryContract.options.address) {
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
//1.  register
function registerProxy(proxyRegistryContract, account) {
    return __awaiter(this, void 0, void 0, function () {
        var proxy, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, proxyRegistryContract.methods.proxies(account).call()];
                case 1:
                    proxy = _a.sent();
                    if (!(proxy === constants_1.NULL_ADDRESS)) return [3 /*break*/, 3];
                    return [4 /*yield*/, proxyRegistryContract.methods.registerProxy().send({
                            from: account
                        })];
                case 2:
                    res = _a.sent();
                    if (!res.status) {
                        throw new error_1.ElementError({ code: '2001', message: 'registerProxy()' });
                    }
                    _a.label = 3;
                case 3: return [2 /*return*/, true];
            }
        });
    });
}
exports.registerProxy = registerProxy;
//2 approve pay token
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
                        // console.log('checkApproveTokenTransferProxy allowAmount %s amount', allowAmount, amount)
                        throw new error_1.ElementError({ code: '1101' });
                    }
                    return [2 /*return*/, true];
            }
        });
    });
}
exports.checkApproveTokenTransferProxy = checkApproveTokenTransferProxy;
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
                        throw new error_1.ElementError({ code: '2001', message: 'tokenTransferProxyAddr approve()' });
                    }
                    _a.label = 4;
                case 4: return [2 /*return*/, true];
            }
        });
    });
}
exports.approveTokenTransferProxy = approveTokenTransferProxy;
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
                        throw new error_1.ElementError({ code: '1102' });
                    }
                    return [2 /*return*/, isApprove];
            }
        });
    });
}
exports.checkApproveERC1155TransferProxy = checkApproveERC1155TransferProxy;
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
                        throw new error_1.ElementError({ code: '2001', message: 'ERC1155 NFTs setApprovalForAll()' });
                    }
                    _a.label = 5;
                case 5: return [2 /*return*/, true];
            }
        });
    });
}
exports.approveERC1155TransferProxy = approveERC1155TransferProxy;
function checkApproveERC721TransferProxy(proxyRegistryContract, nftsContract, account, tokenID) {
    return __awaiter(this, void 0, void 0, function () {
        var isApprove;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, nftsContract.methods.getApproved(tokenID).call()];
                case 1:
                    isApprove = _a.sent();
                    if (!isApprove) {
                        throw new error_1.ElementError({ code: '1102' });
                    }
                    return [2 /*return*/, true];
            }
        });
    });
}
exports.checkApproveERC721TransferProxy = checkApproveERC721TransferProxy;
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
                    if (!res.status) {
                        throw new error_1.ElementError({ code: '2001', message: 'ERC721 NFTs approve()' });
                    }
                    _a.label = 4;
                case 4: return [2 /*return*/, true];
            }
        });
    });
}
exports.approveERC721TransferProxy = approveERC721TransferProxy;
function checkSellUser(contract, asset, paymentTokenAddr, accountAddress) {
    return __awaiter(this, void 0, void 0, function () {
        var ethBal, sellNFTs, bal, isRegister, isApproveERC1155, erc20Contract, isApproveToken;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (paymentTokenAddr == '') {
                        paymentTokenAddr = constants_1.NULL_ADDRESS;
                    }
                    return [4 /*yield*/, getAccountBalance(contract.web3, accountAddress)];
                case 1:
                    ethBal = (_a.sent()).ethBal;
                    if (ethBal == 0) {
                        throw new error_1.ElementError({ code: '1105' });
                    }
                    sellNFTs = contract.erc1155.clone();
                    sellNFTs.options.address = asset.tokenAddress;
                    return [4 /*yield*/, getAccountNFTsBalance(sellNFTs, accountAddress, asset.tokenId)];
                case 2:
                    bal = _a.sent();
                    if (bal == 0) {
                        throw new error_1.ElementError({ code: '1103' });
                    }
                    return [4 /*yield*/, checkRegisterProxy(contract.exchangeProxyRegistry, accountAddress)];
                case 3:
                    isRegister = _a.sent();
                    if (!!isRegister) return [3 /*break*/, 5];
                    return [4 /*yield*/, registerProxy(contract.exchangeProxyRegistry, accountAddress)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    if (!(asset.schemaName == types_1.ElementSchemaName.ERC1155)) return [3 /*break*/, 8];
                    return [4 /*yield*/, checkApproveERC1155TransferProxy(contract.exchangeProxyRegistry, sellNFTs, accountAddress)];
                case 6:
                    isApproveERC1155 = _a.sent();
                    if (!!isApproveERC1155) return [3 /*break*/, 8];
                    return [4 /*yield*/, approveERC1155TransferProxy(contract.exchangeProxyRegistry, sellNFTs, accountAddress)];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8:
                    if (!(paymentTokenAddr != constants_1.NULL_ADDRESS)) return [3 /*break*/, 11];
                    erc20Contract = contract.erc20.clone();
                    erc20Contract.options.address = paymentTokenAddr;
                    return [4 /*yield*/, checkApproveTokenTransferProxy(contract.exchange, erc20Contract, accountAddress)];
                case 9:
                    isApproveToken = _a.sent();
                    if (!!isApproveToken) return [3 /*break*/, 11];
                    return [4 /*yield*/, approveTokenTransferProxy(contract.exchange, erc20Contract, accountAddress)];
                case 10:
                    _a.sent();
                    _a.label = 11;
                case 11: return [2 /*return*/, true];
            }
        });
    });
}
exports.checkSellUser = checkSellUser;
function checkBuyUser(contract, paymentTokenAddr, accountAddress) {
    return __awaiter(this, void 0, void 0, function () {
        var ethBal, isRegister, isApproveWETH, erc20Contract, erc20Bal, isApproveToken;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getAccountBalance(contract.web3, accountAddress)];
                case 1:
                    ethBal = (_a.sent()).ethBal;
                    if (ethBal == 0) {
                        throw new error_1.ElementError({ code: '1105' });
                    }
                    return [4 /*yield*/, checkRegisterProxy(contract.exchangeProxyRegistry, accountAddress)];
                case 2:
                    isRegister = _a.sent();
                    if (!!isRegister) return [3 /*break*/, 4];
                    return [4 /*yield*/, registerProxy(contract.exchangeProxyRegistry, accountAddress)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [4 /*yield*/, checkApproveTokenTransferProxy(contract.exchange, contract.WETH, accountAddress)];
                case 5:
                    isApproveWETH = _a.sent();
                    if (!!isApproveWETH) return [3 /*break*/, 7];
                    return [4 /*yield*/, approveTokenTransferProxy(contract.exchange, contract.WETH, accountAddress)];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7:
                    if (!(paymentTokenAddr != constants_1.NULL_ADDRESS)) return [3 /*break*/, 11];
                    erc20Contract = contract.erc20.clone();
                    erc20Contract.options.address = paymentTokenAddr;
                    return [4 /*yield*/, getAccountBalance(contract.web3, accountAddress, erc20Contract)];
                case 8:
                    erc20Bal = (_a.sent()).erc20Bal;
                    if (erc20Bal == 0) {
                        throw new error_1.ElementError({ code: '1104' });
                    }
                    return [4 /*yield*/, checkApproveTokenTransferProxy(contract.exchange, erc20Contract, accountAddress)];
                case 9:
                    isApproveToken = _a.sent();
                    if (!!isApproveToken) return [3 /*break*/, 11];
                    return [4 /*yield*/, approveTokenTransferProxy(contract.exchange, erc20Contract, accountAddress)];
                case 10:
                    _a.sent();
                    _a.label = 11;
                case 11: return [2 /*return*/, true];
            }
        });
    });
}
exports.checkBuyUser = checkBuyUser;
function checkMatchOrder(contract, buy, sell, accountAddress) {
    return __awaiter(this, void 0, void 0, function () {
        var equalPrice;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    equalPrice = sell.basePrice.gte(buy.basePrice);
                    if (!equalPrice) {
                        throw new error_1.ElementError({ code: '1201' });
                    }
                    return [4 /*yield*/, checkOrder(contract, buy)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, checkOrder(contract, sell)];
                case 2:
                    _a.sent();
                    return [2 /*return*/, true];
            }
        });
    });
}
exports.checkMatchOrder = checkMatchOrder;
function checkOrder(contract, order, accountAddress) {
    return __awaiter(this, void 0, void 0, function () {
        var equalPrice, ethBal, sell, sellNFTs, bal, erc20Contract, buy, erc20Contract, erc20Bal;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, checkRegisterProxy(contract.exchangeProxyRegistry, order.maker)];
                case 1:
                    _a.sent();
                    equalPrice = order.basePrice.gt(0);
                    if (!equalPrice) {
                        throw new error_1.ElementError({ code: '1201' });
                    }
                    return [4 /*yield*/, validateOrder(contract.exchangeHelper, order)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, getAccountBalance(contract.web3, order.maker)];
                case 3:
                    ethBal = (_a.sent()).ethBal;
                    if (markOrder_1.makeBigNumber(ethBal).eq(0)) {
                        throw new error_1.ElementError({ code: '1105' });
                    }
                    if (!(order.side == types_1.OrderSide.Sell)) return [3 /*break*/, 9];
                    sell = order;
                    sellNFTs = contract.erc1155.clone();
                    sellNFTs.options.address = sell.metadata.asset.address;
                    if (!sell.metadata.asset.id) {
                        throw new error_1.ElementError({ code: '1000', message: 'sell.metadata.asset.id undefined' });
                    }
                    return [4 /*yield*/, getAccountNFTsBalance(sellNFTs, sell.maker, sell.metadata.asset.id)];
                case 4:
                    bal = _a.sent();
                    if (bal == 0) {
                        throw new error_1.ElementError({ code: '1103' });
                    }
                    if (!(sell.paymentToken != constants_1.NULL_ADDRESS)) return [3 /*break*/, 6];
                    erc20Contract = contract.erc20.clone();
                    erc20Contract.options.address = sell.paymentToken;
                    return [4 /*yield*/, checkApproveTokenTransferProxy(contract.exchange, erc20Contract, sell.maker)];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6:
                    if (!(sell.metadata.schema == types_1.ElementSchemaName.ERC1155)) return [3 /*break*/, 8];
                    return [4 /*yield*/, checkApproveERC1155TransferProxy(contract.exchangeProxyRegistry, sellNFTs, sell.maker)];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8:
                    checkDataToCall(contract.networkName, sell);
                    _a.label = 9;
                case 9:
                    if (!(order.side == types_1.OrderSide.Buy)) return [3 /*break*/, 13];
                    buy = order;
                    if (!(buy.paymentToken !== constants_1.NULL_ADDRESS)) return [3 /*break*/, 12];
                    erc20Contract = contract.erc20.clone();
                    erc20Contract.options.address = buy.paymentToken;
                    return [4 /*yield*/, getAccountBalance(contract.web3, buy.maker, erc20Contract)];
                case 10:
                    erc20Bal = (_a.sent()).erc20Bal;
                    if (!markOrder_1.makeBigNumber(erc20Bal).gte(buy.basePrice)) {
                        throw new error_1.ElementError({ code: '1105' });
                    }
                    return [4 /*yield*/, checkApproveTokenTransferProxy(contract.exchange, erc20Contract, buy.maker)];
                case 11:
                    _a.sent();
                    return [3 /*break*/, 13];
                case 12:
                    if (contract.web3.eth.defaultAccount &&
                        contract.web3.eth.defaultAccount.toLowerCase() != buy.maker.toLowerCase()) {
                        throw new error_1.ElementError({ code: '1204' });
                    }
                    _a.label = 13;
                case 13: return [2 /*return*/, true];
            }
        });
    });
}
exports.checkOrder = checkOrder;
function checkDataToCall(netWorkName, sell) {
    // encodeSell
    var schemas = markOrder_1.getSchemaList(netWorkName, sell.metadata.schema);
    var _a = schema_1.encodeSell(schemas[0], sell.metadata.asset, sell.maker), target = _a.target, dataToCall = _a.dataToCall, replacementPattern = _a.replacementPattern;
    if (dataToCall != sell.dataToCall) {
        console.log('sell.dataToCall error');
    }
    if (target != sell.target) {
        console.log('sell.target error');
    }
    if (replacementPattern != sell.replacementPattern) {
        console.log('sell.replacementPattern error');
    }
}
exports.checkDataToCall = checkDataToCall;
function validateOrder(exchangeHelper, order) {
    return __awaiter(this, void 0, void 0, function () {
        var orderParamValueArray, orderSigArray, isValidate, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    orderParamValueArray = markOrder_1.orderParamsEncode(order);
                    orderSigArray = markOrder_1.orderSigEncode(order);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, exchangeHelper.methods.validateOrder(orderParamValueArray, orderSigArray).call()];
                case 2:
                    isValidate = _a.sent();
                    if (!isValidate) {
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
function validateAndFormatWalletAddress(web3, address) {
    if (!address) {
        throw new Error('No wallet address found');
    }
    if (!web3.utils.isAddress(address)) {
        throw new Error('Invalid wallet address');
    }
    if (address === constants_1.NULL_ADDRESS) {
        throw new Error('Wallet cannot be the null address');
    }
    return address.toLowerCase();
}
exports.validateAndFormatWalletAddress = validateAndFormatWalletAddress;
var canSettleOrder = function (listingTime, expirationTime) {
    var now = new Date().getTime() / 1000;
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
    return listingTime < now && (expirationTime == 0 || now < expirationTime);
};
function _ordersCanMatch(buy, sell) {
    return (buy.side == 0 &&
        sell.side == 1 &&
        /* Must use same fee method. */
        buy.feeMethod == sell.feeMethod &&
        /* Must use same payment token. */
        buy.paymentToken == sell.paymentToken &&
        /* Must match maker/taker addresses. */
        (sell.taker == constants_1.NULL_ADDRESS || sell.taker == buy.maker) &&
        (buy.taker == constants_1.NULL_ADDRESS || buy.taker == sell.maker) &&
        /* One must be maker and the other must be taker (no bool XOR in Solidity). */
        ((sell.feeRecipient == constants_1.NULL_ADDRESS && buy.feeRecipient != constants_1.NULL_ADDRESS) ||
            (sell.feeRecipient != constants_1.NULL_ADDRESS && buy.feeRecipient == constants_1.NULL_ADDRESS)) &&
        /* Must match target. */
        buy.target == sell.target &&
        /* Must match howToCall. */
        buy.howToCall == sell.howToCall &&
        /* Buy-side order must be settleable. */
        canSettleOrder(buy.listingTime, buy.expirationTime) &&
        /* Sell-side order must be settleable. */
        canSettleOrder(sell.listingTime, sell.expirationTime));
}
exports._ordersCanMatch = _ordersCanMatch;
function ordersCanMatch(exchangeHelper, buy, sell) {
    return __awaiter(this, void 0, void 0, function () {
        var buyOrderParamArray, sellOrderParamArray, canMatch;
        return __generator(this, function (_a) {
            buyOrderParamArray = markOrder_1.orderParamsEncode(buy);
            sellOrderParamArray = markOrder_1.orderParamsEncode(sell);
            canMatch = exchangeHelper.methods.ordersCanMatch(buyOrderParamArray, sellOrderParamArray).call();
            if (!canMatch) {
                throw new error_1.ElementError({ code: '1202' });
            }
            return [2 /*return*/, true];
        });
    });
}
exports.ordersCanMatch = ordersCanMatch;
