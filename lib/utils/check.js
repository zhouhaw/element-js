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
exports.checkMatchOrder = exports.checkBuyUser = exports.checkSellUser = exports.approveERC721TransferProxy = exports.approveERC1155TransferProxy = exports.checkApproveERC1155TransferProxy = exports.approveTokenTransferProxy = exports.checkApproveTokenTransferProxy = exports.registerProxy = exports.checkRegisterProxy = exports.getTokenIDOwner = exports.getAccountNFTsBalance = exports.getAccountBalance = exports.checkSenderOfAuthenticatedProxy = void 0;
var index_1 = require("./index");
var types_1 = require("../types");
function checkSenderOfAuthenticatedProxy(exchangeContract, authenticatedProxyContract, proxyRegistryContract, account) {
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
                    return [4 /*yield*/, exchangeContract.methods.registry().call()];
                case 4:
                    exchangeProxyRegistryAddr = _a.sent();
                    if (authproxyRegistryAddr != exchangeProxyRegistryAddr) {
                        return [2 /*return*/, false];
                    }
                    if (authproxyRegistryAddr != proxyRegistryContract.options.address) {
                        return [2 /*return*/, false];
                    }
                    // 验证是否注册
                    return [2 /*return*/, proxyRegistryContract.methods.contracts(exchangeContract.options.address).call()];
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
            proxy = proxyRegistryContract.methods.proxies(account).call();
            if (proxy === index_1.NULL_ADDRESS) {
                return [2 /*return*/, false];
            }
            else {
                return [2 /*return*/, true];
            }
            return [2 /*return*/];
        });
    });
}
exports.checkRegisterProxy = checkRegisterProxy;
//1. check register
function registerProxy(proxyRegistryContract, account) {
    return __awaiter(this, void 0, void 0, function () {
        var isRegister, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, checkRegisterProxy(proxyRegistryContract, account)];
                case 1:
                    isRegister = _a.sent();
                    if (!!isRegister) return [3 /*break*/, 3];
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
function checkApproveTokenTransferProxy(exchangeContract, erc20Contract, account) {
    return __awaiter(this, void 0, void 0, function () {
        var tokenTransferProxyAddr, amount, allowAmount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, exchangeContract.methods.tokenTransferProxy().call()];
                case 1:
                    tokenTransferProxyAddr = _a.sent();
                    return [4 /*yield*/, erc20Contract.methods.balanceOf(account).call()];
                case 2:
                    amount = _a.sent();
                    return [4 /*yield*/, erc20Contract.methods.allowance(account, tokenTransferProxyAddr).call()];
                case 3:
                    allowAmount = _a.sent();
                    if (Number(allowAmount) == 0) {
                        console.log('checkApproveTokenTransferProxy allowAmount %s amount', allowAmount, amount);
                        return [2 /*return*/, false];
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
        var isApprove, tokenTransferProxyAddr, approveResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, checkApproveTokenTransferProxy(exchangeContract, erc20Contract, account)];
                case 1:
                    isApprove = _a.sent();
                    if (!!isApprove) return [3 /*break*/, 4];
                    return [4 /*yield*/, exchangeContract.methods.tokenTransferProxy().call()];
                case 2:
                    tokenTransferProxyAddr = _a.sent();
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
function checkApproveERC1155TransferProxy(proxyRegistryContract, nftsContract, account) {
    return __awaiter(this, void 0, void 0, function () {
        var operator;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, proxyRegistryContract.methods.proxies(account).call()];
                case 1:
                    operator = _a.sent();
                    return [2 /*return*/, nftsContract.methods.isApprovedForAll(account, operator).call()];
            }
        });
    });
}
exports.checkApproveERC1155TransferProxy = checkApproveERC1155TransferProxy;
//3  approve 1155 NFTs to proxy
function approveERC1155TransferProxy(proxyRegistryContract, nftsContract, account) {
    return __awaiter(this, void 0, void 0, function () {
        var isApprove, operator, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, checkApproveERC1155TransferProxy(proxyRegistryContract, nftsContract, account)];
                case 1:
                    isApprove = _a.sent();
                    if (!!isApprove) return [3 /*break*/, 4];
                    return [4 /*yield*/, proxyRegistryContract.methods.proxies(account).call()];
                case 2:
                    operator = _a.sent();
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
function checkSellUser(contract, asset, paymentTokenAddr, accountAddress) {
    return __awaiter(this, void 0, void 0, function () {
        var sellNFTs, bal, isRegister, isApproveAssetTransfer, erc20Contract, isApproveTokenTransfer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    sellNFTs = contract.erc1155.clone();
                    sellNFTs.options.address = asset.tokenAddress;
                    return [4 /*yield*/, getAccountNFTsBalance(sellNFTs, accountAddress, asset.tokenId)];
                case 1:
                    bal = _a.sent();
                    if (bal == 0) {
                        console.log('createSellOrder :elementSharedAsset balanceOf equal 0 !');
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, registerProxy(contract.exchangeProxyRegistry, accountAddress)];
                case 2:
                    isRegister = _a.sent();
                    if (!isRegister) {
                        console.log('createSellOrder:isRegister false');
                        return [2 /*return*/, false];
                    }
                    if (!(asset.schemaName == types_1.ElementSchemaName.ERC1155)) return [3 /*break*/, 4];
                    return [4 /*yield*/, approveERC1155TransferProxy(contract.exchangeProxyRegistry, sellNFTs, accountAddress)];
                case 3:
                    isApproveAssetTransfer = _a.sent();
                    if (!isApproveAssetTransfer) {
                        console.log('createSellOrder:isApproveAssetTransfer ');
                        return [2 /*return*/, false];
                    }
                    _a.label = 4;
                case 4:
                    if (!(paymentTokenAddr != index_1.NULL_ADDRESS)) return [3 /*break*/, 6];
                    erc20Contract = contract.erc20.clone();
                    erc20Contract.options.address = paymentTokenAddr;
                    return [4 /*yield*/, approveTokenTransferProxy(contract.exchange, erc20Contract, accountAddress)];
                case 5:
                    isApproveTokenTransfer = _a.sent();
                    if (!isApproveTokenTransfer) {
                        console.log('checkBuyUser:isApproveTokenTransfer ');
                        return [2 /*return*/, false];
                    }
                    _a.label = 6;
                case 6: return [2 /*return*/, true];
            }
        });
    });
}
exports.checkSellUser = checkSellUser;
function checkBuyUser(contract, paymentTokenAddr, accountAddress) {
    return __awaiter(this, void 0, void 0, function () {
        var isRegister, isApproveWETH, erc20Contract, erc20Bal, isApproveTokenTransfer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, registerProxy(contract.exchangeProxyRegistry, accountAddress)];
                case 1:
                    isRegister = _a.sent();
                    if (!isRegister) {
                        console.log('checkBuyUser isRegister false');
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, approveTokenTransferProxy(contract.exchange, contract.WETH, accountAddress)];
                case 2:
                    isApproveWETH = _a.sent();
                    if (!isApproveWETH) {
                        console.log('checkBuyUser isApproveWETH false');
                        return [2 /*return*/, false];
                    }
                    if (!(paymentTokenAddr != index_1.NULL_ADDRESS)) return [3 /*break*/, 5];
                    erc20Contract = contract.erc20.clone();
                    erc20Contract.options.address = paymentTokenAddr;
                    return [4 /*yield*/, getAccountBalance(contract.web3, accountAddress, erc20Contract)];
                case 3:
                    erc20Bal = (_a.sent()).erc20Bal;
                    if (erc20Bal == 0) {
                        console.log('checkBuyUser:erc20Bal balance equal 0');
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, approveTokenTransferProxy(contract.exchange, erc20Contract, accountAddress)];
                case 4:
                    isApproveTokenTransfer = _a.sent();
                    if (!isApproveTokenTransfer) {
                        console.log('checkBuyUser:isApproveTokenTransfer ');
                        return [2 /*return*/, false];
                    }
                    _a.label = 5;
                case 5: return [2 /*return*/, true];
            }
        });
    });
}
exports.checkBuyUser = checkBuyUser;
function checkMatchOrder(contract, buy, sell, accountAddress) {
    return __awaiter(this, void 0, void 0, function () {
        var sellRegister, buyRegister, equalPrice, sellNFTs, bal, ethBal, erc20Contract, erc20Bal, isApproveTokenTransfer, erc20Contract, isApproveTokenTransfer, isApproveAssetTransfer, canMatch, schemas, _a, target, dataToCall, replacementPattern, buyIsValid, sellIsValid;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!buy.hash && !sell.hash) {
                        console.log('buy.hash %s sell.hash %s', buy.hash, sell.hash);
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, checkRegisterProxy(contract.exchangeProxyRegistry, sell.maker)];
                case 1:
                    sellRegister = _b.sent();
                    if (!sellRegister) {
                        console.log('checkMatchOrder: sellRegister false');
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, checkRegisterProxy(contract.exchangeProxyRegistry, buy.maker)];
                case 2:
                    buyRegister = _b.sent();
                    if (!buyRegister) {
                        console.log('checkMatchOrder: buyRegister false');
                        return [2 /*return*/, false];
                    }
                    equalPrice = buy.basePrice.eq(sell.basePrice);
                    // const equalPrice: boolean = buy.basePrice == sell.basePrice
                    if (!equalPrice) {
                        console.log('checkMatchOrder:buy.basePrice and sell.basePrice not equal!');
                        return [2 /*return*/, false];
                    }
                    sellNFTs = contract.erc1155.clone();
                    sellNFTs.options.address = sell.metadata.asset.address;
                    return [4 /*yield*/, getAccountNFTsBalance(sellNFTs, sell.maker, sell.metadata.asset.id)
                        // let bal = await getAccountNFTsBalance(this.elementSharedAsset, sell.maker, sell.metadata.asset.id)
                    ];
                case 3:
                    bal = _b.sent();
                    // let bal = await getAccountNFTsBalance(this.elementSharedAsset, sell.maker, sell.metadata.asset.id)
                    if (bal == 0) {
                        console.log('checkMatchOrder:elementSharedAsset balanceOf equal 0 !');
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, getAccountBalance(contract.web3, accountAddress)];
                case 4:
                    ethBal = (_b.sent()).ethBal;
                    if (ethBal == 0) {
                        console.log('checkMatchOrder:ETH balance equal 0');
                        return [2 /*return*/, false];
                    }
                    if (!(buy.paymentToken != index_1.NULL_ADDRESS)) return [3 /*break*/, 7];
                    erc20Contract = contract.erc20.clone();
                    erc20Contract.options.address = buy.paymentToken;
                    return [4 /*yield*/, getAccountBalance(contract.web3, buy.maker, erc20Contract)];
                case 5:
                    erc20Bal = (_b.sent()).erc20Bal;
                    if (!index_1.makeBigNumber(erc20Bal).gt(buy.basePrice)) {
                        console.log('checkMatchOrder:erc20Bal balance', buy.basePrice.toNumber(), erc20Bal);
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, checkApproveTokenTransferProxy(contract.exchange, erc20Contract, buy.maker)];
                case 6:
                    isApproveTokenTransfer = _b.sent();
                    if (!isApproveTokenTransfer) {
                        console.log('checkMatchOrder:isApproveTokenTransfer ');
                        return [2 /*return*/, false];
                    }
                    _b.label = 7;
                case 7:
                    if (!(sell.paymentToken != index_1.NULL_ADDRESS)) return [3 /*break*/, 9];
                    erc20Contract = contract.erc20.clone();
                    erc20Contract.options.address = sell.paymentToken;
                    return [4 /*yield*/, checkApproveTokenTransferProxy(contract.exchange, erc20Contract, sell.maker)];
                case 8:
                    isApproveTokenTransfer = _b.sent();
                    if (!isApproveTokenTransfer) {
                        console.log('checkMatchOrder:isApproveTokenTransfer ');
                        return [2 /*return*/, false];
                    }
                    _b.label = 9;
                case 9:
                    if (!(sell.metadata.schema == types_1.ElementSchemaName.ERC1155)) return [3 /*break*/, 11];
                    return [4 /*yield*/, checkApproveERC1155TransferProxy(contract.exchangeProxyRegistry, sellNFTs, sell.maker)];
                case 10:
                    isApproveAssetTransfer = _b.sent();
                    if (!isApproveAssetTransfer) {
                        console.log('checkMatchOrder:isApproveAssetTransfer ');
                        return [2 /*return*/, false];
                    }
                    _b.label = 11;
                case 11: return [4 /*yield*/, index_1.ordersCanMatch(contract.exchangeHelper, buy, sell)];
                case 12:
                    canMatch = _b.sent();
                    if (!canMatch) {
                        console.log('checkMatchOrder: canMatch false');
                        return [2 /*return*/, false];
                    }
                    schemas = index_1.getSchemaList(types_1.Network.Private, sell.metadata.schema);
                    _a = index_1.encodeSell(schemas[0], sell.metadata.asset, sell.maker), target = _a.target, dataToCall = _a.dataToCall, replacementPattern = _a.replacementPattern;
                    if (dataToCall != sell.dataToCall) {
                        console.log('sell.dataToCall error');
                    }
                    if (target != sell.target) {
                        console.log('sell.target error');
                    }
                    if (replacementPattern != sell.replacementPattern) {
                        console.log('sell.replacementPattern error');
                    }
                    return [4 /*yield*/, index_1.validateOrder(contract.exchangeHelper, buy)];
                case 13:
                    buyIsValid = _b.sent();
                    return [4 /*yield*/, index_1.validateOrder(contract.exchangeHelper, sell)];
                case 14:
                    sellIsValid = _b.sent();
                    if (!sellIsValid && !buyIsValid) {
                        console.log('matchOrder: validateOrder false');
                        return [2 /*return*/, false];
                    }
                    return [2 /*return*/, true];
            }
        });
    });
}
exports.checkMatchOrder = checkMatchOrder;
