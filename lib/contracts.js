"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contracts = void 0;
var types_1 = require("./types");
var abiPath = '../abi/';
// abi
var AuthenticatedProxy = require("../abi/AuthenticatedProxy.json");
var ERC20 = require("../abi/ERC20.json");
var ERC721 = require("../abi/ERC721v3.json");
var ERC1155 = require("../abi/ERC1155.json");
// contract addr
var ElementSharedAsset = require("../abi/ElementSharedAsset.json");
var ElementixProxyRegistry = require("../abi/ElementixProxyRegistry.json");
var ElementixExchange = require("../abi/ElementixExchange.json");
var ExchangeHelper = require("../abi/ExchangeHelper.json");
var ElementixTokenTransferProxy = require("../abi/ElementixTokenTransferProxy.json");
var WETH = require("../abi/WETH9Mocked.json");
var MakeTokenID = require("../abi/MakeTokenID.json");
var constants_1 = require("./utils/constants");
var Contracts = /** @class */ (function () {
    // public makeTokenID: any
    // let networkID: number = await web3.eth.net.getId()
    function Contracts(web3, apiConfig) {
        if (apiConfig === void 0) { apiConfig = { networkName: types_1.Network.Rinkeby }; }
        var networkName = apiConfig.networkName;
        var gasPrice = 10e9;
        var gasLimit = 80e4;
        this.networkName = networkName;
        var contracts = constants_1.CONTRACTS_ADDRESSES[networkName];
        var exchangeHelperAddr = contracts.ExchangeHelper.toLowerCase();
        var exchangeAddr = contracts.ElementixExchange.toLowerCase();
        var proxyRegistryAddr = contracts.ElementixProxyRegistry.toLowerCase();
        var elementSharedAssetAddr = contracts.ElementSharedAsset.toLowerCase();
        var elementixTokenTransferProxyAddr = contracts.ElementixTokenTransferProxy.toLowerCase();
        var elementixExchangeKeeperAddr = contracts.ElementixExchangeKeeper.toLowerCase();
        var wethAddr = contracts.WETH.toLowerCase();
        // }
        // const makeTokenIDAddr = MakeTokenID.networks[networkID].address
        this.WETHAddr = wethAddr;
        this.elementSharedAssetAddr = elementSharedAssetAddr;
        this.elementixExchangeKeeperAddr = elementixExchangeKeeperAddr;
        this.tokenTransferProxyAddr = elementixTokenTransferProxyAddr;
        var options = {
            gas: gasLimit
        };
        if (exchangeHelperAddr && exchangeAddr && proxyRegistryAddr) {
            this.exchangeHelper = new web3.eth.Contract(ExchangeHelper.abi, exchangeHelperAddr, options);
            this.exchangeProxyRegistry = new web3.eth.Contract(ElementixProxyRegistry.abi, proxyRegistryAddr, options);
            this.exchange = new web3.eth.Contract(ElementixExchange.abi, exchangeAddr, options);
            // asset
            this.WETH = new web3.eth.Contract(WETH.abi, wethAddr, options);
            // this.makeTokenID = new web3.eth.Contract(MakeTokenID.abi, makeTokenIDAddr, options)
            this.elementSharedAsset = new web3.eth.Contract(ElementSharedAsset.abi, elementSharedAssetAddr, options);
            // abi
            this.erc20 = new web3.eth.Contract(ERC20.abi, options);
            this.erc721 = new web3.eth.Contract(ERC721.abi, options);
            this.erc1155 = new web3.eth.Contract(ERC1155.abi, options);
            this.authenticatedProxy = new web3.eth.Contract(AuthenticatedProxy.abi, options);
            this.web3 = web3;
        }
        else {
            // eslint-disable-next-line no-throw-literal
            throw this.networkName + "  abi undefined";
        }
    }
    return Contracts;
}());
exports.Contracts = Contracts;
