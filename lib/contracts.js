"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contracts = void 0;
var types_1 = require("./types");
var events_1 = require("events");
var abiPath = '../abi/';
// auth proxy abi
var AuthenticatedProxy = require("../abi/AuthenticatedProxy.json");
// asset abi
var ERC20 = require("../abi/ERC20.json");
var ERC721 = require("../abi/ERC721v3.json");
var ERC1155 = require("../abi/ERC1155.json");
// contract abi
var ElementSharedAsset = require("../abi/ElementSharedAsset.json");
var ElementixProxyRegistry = require("../abi/ElementixProxyRegistry.json");
var ElementixExchange = require("../abi/ElementixExchange.json");
var ExchangeHelper = require("../abi/ExchangeHelper.json");
var WETHAbi = require("../abi/WETH9Mocked.json");
var constants_1 = require("./utils/constants");
var tokens_1 = require("./schema/tokens");
// import { schemas } from './schema/schemas'
var Contracts = /** @class */ (function (_super) {
    __extends(Contracts, _super);
    function Contracts(web3, apiConfig) {
        if (apiConfig === void 0) { apiConfig = { networkName: types_1.Network.Rinkeby }; }
        var _this = _super.call(this) || this;
        _this.ETH = {
            name: 'etherem',
            symbol: 'ETH',
            address: constants_1.NULL_ADDRESS,
            decimals: 18
        };
        var networkName = apiConfig.networkName, paymentTokens = apiConfig.paymentTokens;
        _this.paymentTokenList = paymentTokens || tokens_1.tokens[networkName].otherTokens;
        // const gasPrice = 10e9
        // const gasLimit = 80e4
        _this.networkName = networkName;
        // this.assetSchemas = schemas[networkName]
        var contracts = constants_1.CONTRACTS_ADDRESSES[networkName];
        var exchangeHelperAddr = contracts.ExchangeHelper.toLowerCase();
        var exchangeAddr = contracts.ElementixExchange.toLowerCase();
        var proxyRegistryAddr = contracts.ElementixProxyRegistry.toLowerCase();
        var elementSharedAssetAddr = contracts.ElementSharedAsset.toLowerCase();
        var elementixExchangeKeeperAddr = contracts.ElementixExchangeKeeper.toLowerCase();
        var feeRecipientAddress = contracts.FeeRecipientAddress.toLowerCase();
        var wethAddr = contracts.WETH.toLowerCase();
        _this.contractsAddr = contracts;
        _this.WETHAddr = wethAddr;
        _this.WETHToekn = {
            name: 'WETH9',
            symbol: 'WETH',
            address: wethAddr,
            decimals: 18
        };
        _this.elementSharedAssetAddr = elementSharedAssetAddr;
        _this.elementixExchangeKeeperAddr = elementixExchangeKeeperAddr;
        _this.feeRecipientAddress = feeRecipientAddress;
        var options = {
        // gas: gasLimit
        };
        if (exchangeHelperAddr && exchangeAddr && proxyRegistryAddr) {
            _this.exchangeHelper = new web3.eth.Contract(ExchangeHelper.abi, exchangeHelperAddr, options);
            _this.exchangeProxyRegistry = new web3.eth.Contract(ElementixProxyRegistry.abi, proxyRegistryAddr, options);
            _this.exchange = new web3.eth.Contract(ElementixExchange.abi, exchangeAddr, options);
            // asset
            _this.WETHContract = new web3.eth.Contract(WETHAbi.abi, wethAddr, options);
            _this.elementSharedAsset = new web3.eth.Contract(ElementSharedAsset.abi, elementSharedAssetAddr, options);
            // abi
            _this.erc20 = new web3.eth.Contract(ERC20.abi, options);
            _this.erc721 = new web3.eth.Contract(ERC721.abi, options);
            _this.erc1155 = new web3.eth.Contract(ERC1155.abi, options);
            _this.authenticatedProxy = new web3.eth.Contract(AuthenticatedProxy.abi, options);
            _this.web3 = web3;
        }
        else {
            throw new Error(_this.networkName + "  abi undefined");
        }
        // @ts-ignore
        if (contracts.ElementSharedAssetV1) {
            // @ts-ignore
            _this.elementSharedAssetV1 = new web3.eth.Contract(ElementSharedAsset.abi, contracts.ElementSharedAssetV1, options);
        }
        return _this;
    }
    return Contracts;
}(events_1.EventEmitter));
exports.Contracts = Contracts;
