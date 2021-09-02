"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.STATIC_EXTRADATA = exports.INVERSE_BASIS_POINT = exports.ELEMENT_SELLER_BOUNTY_BASIS_POINTS = exports.DEFAULT_MAX_BOUNTY = exports.DEFAULT_SELLER_FEE_BASIS_POINTS = exports.DEFAULT_BUYER_FEE_BASIS_POINTS = exports.ORDER_MATCHING_LATENCY_SECONDS = exports.MIN_Listing_SECONDS = exports.MIN_EXPIRATION_SECONDS = exports.MAX_UINT_256 = exports.MAX_DIGITS_IN_UNSIGNED_256_INT = exports.NULL_BLOCK_HASH = exports.NULL_ADDRESS = exports.BigNumber = void 0;
var bignumber_js_1 = __importDefault(require("bignumber.js"));
exports.BigNumber = bignumber_js_1.default;
bignumber_js_1.default.config({ EXPONENTIAL_AT: 1e9 });
exports.NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
exports.NULL_BLOCK_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000';
exports.MAX_DIGITS_IN_UNSIGNED_256_INT = 78; // 78 solt
exports.MAX_UINT_256 = '115792089237316195423570985008687907853269984665640564039457584007913129639935'; //new BigNumber(2).pow(256).minus(1).toString()
exports.MIN_EXPIRATION_SECONDS = 10;
exports.MIN_Listing_SECONDS = 10;
exports.ORDER_MATCHING_LATENCY_SECONDS = 60 * 60 * 24 * 7;
// FEE
exports.DEFAULT_BUYER_FEE_BASIS_POINTS = 0;
exports.DEFAULT_SELLER_FEE_BASIS_POINTS = 200; //2%
exports.DEFAULT_MAX_BOUNTY = exports.DEFAULT_SELLER_FEE_BASIS_POINTS;
//BOUNTY 版权费
exports.ELEMENT_SELLER_BOUNTY_BASIS_POINTS = 100; //1%
exports.INVERSE_BASIS_POINT = 10000; //100%
//static call
exports.STATIC_EXTRADATA = '0x0c225aad'; //succeedIfTxOriginMatchesHardcodedAddress
