"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HowToCall = exports.SaleKind = exports.OrderSide = exports.FeeMethod = exports.TokenStandardVersion = exports.ElementSchemaName = exports.AbiType = exports.BigNumber = exports.Network = void 0;
var bignumber_js_1 = require("bignumber.js");
Object.defineProperty(exports, "BigNumber", { enumerable: true, get: function () { return bignumber_js_1.BigNumber; } });
var types_1 = require("./schema/types");
Object.defineProperty(exports, "Network", { enumerable: true, get: function () { return types_1.Network; } });
var AbiType;
(function (AbiType) {
    AbiType["Function"] = "function";
    AbiType["Constructor"] = "constructor";
    AbiType["Event"] = "event";
    AbiType["Fallback"] = "fallback";
})(AbiType = exports.AbiType || (exports.AbiType = {}));
// Element Schemas (see https://github.com/ProjectOpenSea/wyvern-schemas)
var ElementSchemaName;
(function (ElementSchemaName) {
    ElementSchemaName["ERC20"] = "ERC20";
    ElementSchemaName["ERC721"] = "ERC721";
    ElementSchemaName["ERC1155"] = "ERC1155";
    ElementSchemaName["LegacyEnjin"] = "Enjin";
    ElementSchemaName["ENSShortNameAuction"] = "ENSShortNameAuction";
    ElementSchemaName["ElementShardType"] = "ElementShardType";
    ElementSchemaName["CryptoPunks"] = "CryptoPunks";
})(ElementSchemaName = exports.ElementSchemaName || (exports.ElementSchemaName = {}));
var TokenStandardVersion;
(function (TokenStandardVersion) {
    TokenStandardVersion["Unsupported"] = "unsupported";
    TokenStandardVersion["Locked"] = "locked";
    TokenStandardVersion["Enjin"] = "1155-1.0";
    TokenStandardVersion["ERC721v1"] = "1.0";
    TokenStandardVersion["ERC721v2"] = "2.0";
    TokenStandardVersion["ERC721v3"] = "3.0";
})(TokenStandardVersion = exports.TokenStandardVersion || (exports.TokenStandardVersion = {}));
var FeeMethod;
(function (FeeMethod) {
    FeeMethod[FeeMethod["ProtocolFee"] = 0] = "ProtocolFee";
    FeeMethod[FeeMethod["SplitFee"] = 1] = "SplitFee";
})(FeeMethod = exports.FeeMethod || (exports.FeeMethod = {}));
var OrderSide;
(function (OrderSide) {
    OrderSide[OrderSide["Buy"] = 0] = "Buy";
    OrderSide[OrderSide["Sell"] = 1] = "Sell";
})(OrderSide = exports.OrderSide || (exports.OrderSide = {}));
var SaleKind;
(function (SaleKind) {
    SaleKind[SaleKind["FixedPrice"] = 0] = "FixedPrice";
    SaleKind[SaleKind["EnglishAuction"] = 1] = "EnglishAuction";
    SaleKind[SaleKind["DutchAuction"] = 2] = "DutchAuction";
})(SaleKind = exports.SaleKind || (exports.SaleKind = {}));
var HowToCall;
(function (HowToCall) {
    HowToCall[HowToCall["Call"] = 0] = "Call";
    HowToCall[HowToCall["DelegateCall"] = 1] = "DelegateCall";
    HowToCall[HowToCall["StaticCall"] = 2] = "StaticCall";
    HowToCall[HowToCall["Create"] = 3] = "Create";
})(HowToCall = exports.HowToCall || (exports.HowToCall = {}));
