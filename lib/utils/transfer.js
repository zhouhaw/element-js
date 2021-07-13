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
exports.validateAndFormatWalletAddress = exports.transferFromWETH = exports.transferFromERC20 = exports.transferFromERC721 = exports.transferFromERC1155 = void 0;
var constants_1 = require("./constants");
var helper_1 = require("./helper");
var index_1 = require("../index");
function transferFailure(error) {
    var error_ = error.code === '4001'
        ? new index_1.ElementError(error)
        : new index_1.ElementError({ code: '1000', message: 'Transfer Asset failure' });
    throw error_;
}
function transferFromERC1155(_a, callBack) {
    var erc1155Contract = _a.erc1155Contract, from = _a.from, to = _a.to, tokenId = _a.tokenId, amount = _a.amount;
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_b) {
            return [2 /*return*/, erc1155Contract.methods
                    .safeTransferFrom(from, to, tokenId, amount, '0x')
                    .send({ from: from })
                    .on('transactionHash', function (txHash) {
                    // console.log('Send success tx hash：', txHash)
                    var assetAddress = erc1155Contract.options.address;
                    callBack === null || callBack === void 0 ? void 0 : callBack.next(index_1.OrderCheckStatus.TransferErc1155, { txHash: txHash, from: from, to: to, tokenId: tokenId, amount: amount, assetAddress: assetAddress });
                })
                    .catch(function (error) {
                    transferFailure(error);
                })];
        });
    });
}
exports.transferFromERC1155 = transferFromERC1155;
function transferFromERC721(_a, callBack) {
    var erc721Contract = _a.erc721Contract, from = _a.from, to = _a.to, tokenId = _a.tokenId, amount = _a.amount;
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_b) {
            return [2 /*return*/, erc721Contract.methods
                    .safeTransferFrom(from, to, tokenId)
                    .send({ from: from })
                    .on('transactionHash', function (txHash) {
                    var assetAddress = erc721Contract.options.address;
                    callBack === null || callBack === void 0 ? void 0 : callBack.next(index_1.OrderCheckStatus.TransferErc721, { txHash: txHash, from: from, to: to, tokenId: tokenId, assetAddress: assetAddress });
                    console.log('Send success tx hash：', txHash);
                })];
        });
    });
}
exports.transferFromERC721 = transferFromERC721;
function transferFromERC20(_a, callBack) {
    var erc20Contract = _a.erc20Contract, from = _a.from, to = _a.to, tokenId = _a.tokenId, amount = _a.amount;
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_b) {
            return [2 /*return*/, erc20Contract.methods.safeTransferFrom(from, to, tokenId, amount, '0x').send({ from: from })];
        });
    });
}
exports.transferFromERC20 = transferFromERC20;
function transferFromWETH(_a, callBack) {
    var WETHContract = _a.WETHContract, from = _a.from, to = _a.to, tokenId = _a.tokenId, amount = _a.amount;
    return __awaiter(this, void 0, void 0, function () {
        var sellBal;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, WETHContract.methods.balanceOf(from).call()];
                case 1:
                    sellBal = _b.sent();
                    if (!(Number(sellBal) < 1e18)) return [3 /*break*/, 4];
                    return [4 /*yield*/, WETHContract.methods.deposit().send({
                            from: from,
                            value: helper_1.toBaseUnitAmount(helper_1.makeBigNumber(amount), 18)
                        })];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, WETHContract.methods.balanceOf(from).call()];
                case 3:
                    sellBal = _b.sent();
                    _b.label = 4;
                case 4: return [2 /*return*/, sellBal];
            }
        });
    });
}
exports.transferFromWETH = transferFromWETH;
/**
 * Validates that an address exists, isn't null, and is properly
 * formatted for Wyvern and OpenSea
 * @param address input address
 */
function validateAndFormatWalletAddress(web3, address) {
    if (!address) {
        throw new Error('No wallet address found');
    }
    if (!web3.utils.isAddress(address)) {
        throw new Error('Invalid wallet address');
    }
    if (address == constants_1.NULL_ADDRESS) {
        throw new Error('Wallet cannot be the null address');
    }
    return address.toLowerCase();
}
exports.validateAndFormatWalletAddress = validateAndFormatWalletAddress;
