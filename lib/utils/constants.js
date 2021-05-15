"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ORDER_MATCHING_LATENCY_SECONDS = exports.MIN_EXPIRATION_SECONDS = exports.INVERSE_BASIS_POINT = exports.MAX_UINT_256 = exports.MAX_DIGITS_IN_UNSIGNED_256_INT = exports.NULL_BLOCK_HASH = exports.NULL_ADDRESS = exports.BigNumber = void 0;
var bignumber_js_1 = __importDefault(require("bignumber.js"));
exports.BigNumber = bignumber_js_1.default;
bignumber_js_1.default.config({ EXPONENTIAL_AT: 1e9 });
exports.NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
exports.NULL_BLOCK_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000';
exports.MAX_DIGITS_IN_UNSIGNED_256_INT = 78; // 78 solt
exports.MAX_UINT_256 = new bignumber_js_1.default(2).pow(256).minus(1); // approve
exports.INVERSE_BASIS_POINT = 10000;
exports.MIN_EXPIRATION_SECONDS = 10;
exports.ORDER_MATCHING_LATENCY_SECONDS = 60 * 60 * 24 * 7;
