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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contracts = void 0;
var types_1 = require("./types");
var events_1 = require("events");
// const abiPath = '../abi/'
// auth proxy abi
var AuthenticatedProxy_json_1 = __importDefault(require("../abi/AuthenticatedProxy.json"));
// asset abi
var ERC20_json_1 = __importDefault(require("../abi/ERC20.json"));
var ERC721v3_json_1 = __importDefault(require("../abi/ERC721v3.json"));
var ERC1155_json_1 = __importDefault(require("../abi/ERC1155.json"));
// contract abi
var ElementSharedAsset_json_1 = __importDefault(require("../abi/ElementSharedAsset.json"));
var ElementixProxyRegistry_json_1 = __importDefault(require("../abi/ElementixProxyRegistry.json"));
var ElementixExchange_json_1 = __importDefault(require("../abi/ElementixExchange.json"));
var ExchangeHelper_json_1 = __importDefault(require("../abi/ExchangeHelper.json"));
var WETH9Mocked_json_1 = __importDefault(require("../abi/WETH9Mocked.json"));
// const WETHAbi = import(`../abi/WETH9Mocked.json`)
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
        // gas: 80e4
        };
        if (exchangeHelperAddr && exchangeAddr && proxyRegistryAddr) {
            _this.exchangeHelper = new web3.eth.Contract(ExchangeHelper_json_1.default.abi, exchangeHelperAddr, options);
            _this.exchangeProxyRegistry = new web3.eth.Contract(ElementixProxyRegistry_json_1.default.abi, proxyRegistryAddr, options);
            _this.exchange = new web3.eth.Contract(ElementixExchange_json_1.default.abi, exchangeAddr, options);
            // asset
            _this.WETHContract = new web3.eth.Contract(WETH9Mocked_json_1.default.abi, wethAddr, options);
            _this.elementSharedAsset = new web3.eth.Contract(ElementSharedAsset_json_1.default.abi, elementSharedAssetAddr, options);
            // abi
            _this.erc20 = new web3.eth.Contract(ERC20_json_1.default.abi, options);
            _this.erc721 = new web3.eth.Contract(ERC721v3_json_1.default.abi, options);
            _this.erc1155 = new web3.eth.Contract(ERC1155_json_1.default.abi, options);
            _this.authenticatedProxy = new web3.eth.Contract(AuthenticatedProxy_json_1.default.abi, options);
            _this.web3 = web3;
        }
        else {
            throw new Error(_this.networkName + "  abi undefined");
        }
        if (contracts.ElementSharedAssetV1) {
            _this.elementSharedAssetV1 = new web3.eth.Contract(ElementSharedAsset_json_1.default.abi, contracts.ElementSharedAssetV1, options);
        }
        return _this;
    }
    return Contracts;
}(events_1.EventEmitter));
exports.Contracts = Contracts;
