"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contracts = void 0;
var types_1 = require("./schema/types");
var abiPath = '../abi/';
// abi
var AuthenticatedProxy = require(abiPath + "AuthenticatedProxy.json");
var ERC20 = require(abiPath + "ERC20.json");
var ERC721 = require(abiPath + "ERC721v3.json");
var ERC1155 = require(abiPath + "ERC1155.json");
// contract addr
var ElementSharedAsset = require(abiPath + "ElementSharedAsset.json");
var ElementixProxyRegistry = require(abiPath + "ElementixProxyRegistry.json");
var ElementixExchange = require(abiPath + "ElementixExchange.json");
var ExchangeHelper = require(abiPath + "ExchangeHelper.json");
var ElementixTokenTransferProxy = require(abiPath + "ElementixTokenTransferProxy.json");
var WEHT = require(abiPath + "WETH9Mocked.json");
var Contracts = /** @class */ (function () {
    // let networkID: number = await web3.eth.net.getId()
    function Contracts(web3, apiConfig) {
        if (apiConfig === void 0) { apiConfig = { networkName: types_1.Network.Rinkeby, networkID: 1 }; }
        var networkID = apiConfig.networkID, networkName = apiConfig.networkName;
        var gasPrice = 10e9;
        var gasLimit = 80e4;
        this.networkName = networkName;
        var exchangeHelperAddr = ExchangeHelper.networks[networkID].address;
        var exchangeAddr = ElementixExchange.networks[networkID].address;
        var proxyRegistryAddr = ElementixProxyRegistry.networks[networkID].address;
        var elementSharedAssetAddr = ElementSharedAsset.networks[networkID].address;
        this.WETHAddr = WEHT.networks[networkID].address;
        this.elementSharedAssetAddr = elementSharedAssetAddr;
        this.tokenTransferProxyAddr = ElementixTokenTransferProxy.networks[networkID].address;
        var options = {
            gas: gasLimit
        };
        if (exchangeHelperAddr && exchangeAddr && proxyRegistryAddr) {
            this.exchangeHelper = new web3.eth.Contract(ExchangeHelper.abi, exchangeHelperAddr, options);
            this.exchangeProxyRegistry = new web3.eth.Contract(ElementixProxyRegistry.abi, proxyRegistryAddr, options);
            this.exchange = new web3.eth.Contract(ElementixExchange.abi, exchangeAddr, options);
            // asset
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
            throw this.networkName + " networkID " + networkID + " abi undefined";
        }
    }
    return Contracts;
}());
exports.Contracts = Contracts;
