"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contracts = void 0;
var types_1 = require("./types");
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
var Contracts = /** @class */ (function () {
    function Contracts(web3, apiConfig) {
        if (apiConfig === void 0) { apiConfig = { networkName: types_1.Network.Rinkeby }; }
        this.ETH = {
            name: 'etherem',
            symbol: 'ETH',
            address: constants_1.NULL_ADDRESS,
            decimals: 18
        };
        var networkName = apiConfig.networkName, paymentTokens = apiConfig.paymentTokens;
        this.paymentTokenList = paymentTokens || tokens_1.tokens[networkName].otherTokens;
        var gasPrice = 10e9;
        var gasLimit = 80e4;
        this.networkName = networkName;
        var contracts = constants_1.CONTRACTS_ADDRESSES[networkName];
        var exchangeHelperAddr = contracts.ExchangeHelper.toLowerCase();
        var exchangeAddr = contracts.ElementixExchange.toLowerCase();
        var proxyRegistryAddr = contracts.ElementixProxyRegistry.toLowerCase();
        var elementSharedAssetAddr = contracts.ElementSharedAsset.toLowerCase();
        var elementixExchangeKeeperAddr = contracts.ElementixExchangeKeeper.toLowerCase();
        var feeRecipientAddress = contracts.FeeRecipientAddress.toLowerCase();
        var wethAddr = contracts.WETH.toLowerCase();
        this.contractsAddr = contracts;
        this.WETHAddr = wethAddr;
        this.WETHToekn = {
            name: 'WETH9',
            symbol: 'WETH',
            address: wethAddr,
            decimals: 18
        };
        this.elementSharedAssetAddr = elementSharedAssetAddr;
        this.elementixExchangeKeeperAddr = elementixExchangeKeeperAddr;
        this.feeRecipientAddress = feeRecipientAddress;
        var options = {
            gas: gasLimit
        };
        if (exchangeHelperAddr && exchangeAddr && proxyRegistryAddr) {
            this.exchangeHelper = new web3.eth.Contract(ExchangeHelper.abi, exchangeHelperAddr, options);
            this.exchangeProxyRegistry = new web3.eth.Contract(ElementixProxyRegistry.abi, proxyRegistryAddr, options);
            this.exchange = new web3.eth.Contract(ElementixExchange.abi, exchangeAddr, options);
            // asset
            this.WETHContract = new web3.eth.Contract(WETHAbi.abi, wethAddr, options);
            this.elementSharedAsset = new web3.eth.Contract(ElementSharedAsset.abi, elementSharedAssetAddr, options);
            // abi
            this.erc20 = new web3.eth.Contract(ERC20.abi, options);
            this.erc721 = new web3.eth.Contract(ERC721.abi, options);
            this.erc1155 = new web3.eth.Contract(ERC1155.abi, options);
            this.authenticatedProxy = new web3.eth.Contract(AuthenticatedProxy.abi, options);
            this.web3 = web3;
        }
        else {
            throw new Error(this.networkName + "  abi undefined");
        }
        // @ts-ignore
        if (contracts.ElementSharedAssetV1) {
            // @ts-ignore
            this.elementSharedAssetV1 = new web3.eth.Contract(ElementSharedAsset.abi, contracts.ElementSharedAssetV1, options);
        }
    }
    return Contracts;
}());
exports.Contracts = Contracts;
