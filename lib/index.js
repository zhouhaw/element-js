"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElementError = exports.ErrorCodes = exports.Contracts = exports.ElementOrders = exports.OrdersAPI = exports.OrderCheckStatus = exports.Orders = exports.makeBigNumber = exports.getSchemaList = exports.getAccountBalance = exports.getTokenIDOwner = exports.toBaseUnitAmount = exports.getTokenList = exports.elementSignInSign = exports.web3Sign = exports.CHAIN = exports.ID_CHAINNAME = exports.CHAIN_ID = exports.DEFAULT_SELLER_FEE_BASIS_POINTS = exports.NULL_BLOCK_HASH = exports.NULL_ADDRESS = exports.BigNumber = exports.approveERC721TransferProxy = exports.approveERC1155TransferProxy = exports.approveTokenTransferProxy = exports.approveSchemaProxy = exports.registerProxy = exports.getElementAssetURI = exports.encodeParamsCall = exports.encodeCall = exports.encodeSell = exports.encodeBuy = exports.schemas = exports.SaleKind = exports.OrderSide = exports.Network = exports.HowToCall = exports.FeeMethod = exports.ElementSchemaName = void 0;
var types_1 = require("./src/types");
Object.defineProperty(exports, "ElementSchemaName", { enumerable: true, get: function () { return types_1.ElementSchemaName; } });
Object.defineProperty(exports, "FeeMethod", { enumerable: true, get: function () { return types_1.FeeMethod; } });
Object.defineProperty(exports, "HowToCall", { enumerable: true, get: function () { return types_1.HowToCall; } });
Object.defineProperty(exports, "Network", { enumerable: true, get: function () { return types_1.Network; } });
Object.defineProperty(exports, "OrderSide", { enumerable: true, get: function () { return types_1.OrderSide; } });
Object.defineProperty(exports, "SaleKind", { enumerable: true, get: function () { return types_1.SaleKind; } });
var schema_1 = require("./src/schema");
Object.defineProperty(exports, "schemas", { enumerable: true, get: function () { return schema_1.schemas; } });
Object.defineProperty(exports, "encodeBuy", { enumerable: true, get: function () { return schema_1.encodeBuy; } });
Object.defineProperty(exports, "encodeSell", { enumerable: true, get: function () { return schema_1.encodeSell; } });
Object.defineProperty(exports, "encodeCall", { enumerable: true, get: function () { return schema_1.encodeCall; } });
Object.defineProperty(exports, "encodeParamsCall", { enumerable: true, get: function () { return schema_1.encodeParamsCall; } });
// export {
//   getElementAssetURI,
//   ordersCanMatch,
//   validateOrder,
//   checkOrder,
//   checkMatchOrder,
//   checkRegisterProxy,
//   getOrderCancelledOrFinalized,
//   checkApproveTokenTransferProxy,
//   checkApproveERC1155TransferProxy,
//   checkSenderOfAuthenticatedProxy
// } from './src/utils/check'
var assets_1 = require("./src/utils/assets");
Object.defineProperty(exports, "getElementAssetURI", { enumerable: true, get: function () { return assets_1.getElementAssetURI; } });
var approve_1 = require("./src/utils/approve");
Object.defineProperty(exports, "registerProxy", { enumerable: true, get: function () { return approve_1.registerProxy; } });
Object.defineProperty(exports, "approveSchemaProxy", { enumerable: true, get: function () { return approve_1.approveSchemaProxy; } });
Object.defineProperty(exports, "approveTokenTransferProxy", { enumerable: true, get: function () { return approve_1.approveTokenTransferProxy; } });
Object.defineProperty(exports, "approveERC1155TransferProxy", { enumerable: true, get: function () { return approve_1.approveERC1155TransferProxy; } });
Object.defineProperty(exports, "approveERC721TransferProxy", { enumerable: true, get: function () { return approve_1.approveERC721TransferProxy; } });
// export { orderToJSON, getPriceParameters, getCurrentPrice, computeOrderCallData } from './src/utils/makeOrder'
var constants_1 = require("./src/utils/constants");
Object.defineProperty(exports, "BigNumber", { enumerable: true, get: function () { return constants_1.BigNumber; } });
Object.defineProperty(exports, "NULL_ADDRESS", { enumerable: true, get: function () { return constants_1.NULL_ADDRESS; } });
Object.defineProperty(exports, "NULL_BLOCK_HASH", { enumerable: true, get: function () { return constants_1.NULL_BLOCK_HASH; } });
Object.defineProperty(exports, "DEFAULT_SELLER_FEE_BASIS_POINTS", { enumerable: true, get: function () { return constants_1.DEFAULT_SELLER_FEE_BASIS_POINTS; } });
var config_1 = require("./src/api/config");
Object.defineProperty(exports, "CHAIN_ID", { enumerable: true, get: function () { return config_1.CHAIN_ID; } });
Object.defineProperty(exports, "ID_CHAINNAME", { enumerable: true, get: function () { return config_1.ID_CHAINNAME; } });
Object.defineProperty(exports, "CHAIN", { enumerable: true, get: function () { return config_1.CHAIN; } });
// export {
//   PRIVATE_CONTRACTS_ADDRESSES,
//   MAIN_CONTRACTS_ADDRESSES,
//   RINKEBY_CONTRACTS_ADDRESSES,
//   MUMBAI_CONTRACTS_ADDRESSES,
//   CONTRACTS_ADDRESSES
// } from './src/contracts/config'
// export { orderFromJSON, Sleep } from './src/utils'
var helper_1 = require("./src/utils/helper");
Object.defineProperty(exports, "web3Sign", { enumerable: true, get: function () { return helper_1.web3Sign; } });
// export {
//   transferFromERC1155,
//   transferFromERC721,
//   transferFromERC20,
//   transferFromWETH,
//   transferFromSchema
// } from './src/utils/transfer'
var helper_2 = require("./src/utils/helper");
Object.defineProperty(exports, "elementSignInSign", { enumerable: true, get: function () { return helper_2.elementSignInSign; } });
Object.defineProperty(exports, "getTokenList", { enumerable: true, get: function () { return helper_2.getTokenList; } });
Object.defineProperty(exports, "toBaseUnitAmount", { enumerable: true, get: function () { return helper_2.toBaseUnitAmount; } });
Object.defineProperty(exports, "getTokenIDOwner", { enumerable: true, get: function () { return helper_2.getTokenIDOwner; } });
Object.defineProperty(exports, "getAccountBalance", { enumerable: true, get: function () { return helper_2.getAccountBalance; } });
Object.defineProperty(exports, "getSchemaList", { enumerable: true, get: function () { return helper_2.getSchemaList; } });
Object.defineProperty(exports, "makeBigNumber", { enumerable: true, get: function () { return helper_2.makeBigNumber; } });
var orders_1 = require("./src/orders");
Object.defineProperty(exports, "Orders", { enumerable: true, get: function () { return orders_1.Orders; } });
Object.defineProperty(exports, "OrderCheckStatus", { enumerable: true, get: function () { return orders_1.OrderCheckStatus; } });
var ordersApi_1 = require("./src/api/restful/ordersApi");
Object.defineProperty(exports, "OrdersAPI", { enumerable: true, get: function () { return ordersApi_1.OrdersAPI; } });
var api_1 = require("./src/api");
Object.defineProperty(exports, "ElementOrders", { enumerable: true, get: function () { return api_1.ElementOrders; } });
var contracts_1 = require("./src/contracts");
Object.defineProperty(exports, "Contracts", { enumerable: true, get: function () { return contracts_1.Contracts; } });
var error_1 = require("./src/base/error");
Object.defineProperty(exports, "ErrorCodes", { enumerable: true, get: function () { return error_1.ErrorCodes; } });
Object.defineProperty(exports, "ElementError", { enumerable: true, get: function () { return error_1.ElementError; } });
