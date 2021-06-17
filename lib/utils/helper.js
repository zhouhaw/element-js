"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeBigNumber = exports.toBaseUnitAmount = void 0;
var constants_1 = require("./constants");
function toBaseUnitAmount(amount, decimals) {
    var unit = new constants_1.BigNumber(10).pow(decimals);
    return amount.times(unit).integerValue();
}
exports.toBaseUnitAmount = toBaseUnitAmount;
function makeBigNumber(arg) {
    // Zero sometimes returned as 0x from contracts
    if (arg === '0x') {
        arg = 0;
    }
    // fix "new BigNumber() number type has more than 15 significant digits"
    arg = arg.toString();
    return new constants_1.BigNumber(arg);
}
exports.makeBigNumber = makeBigNumber;
