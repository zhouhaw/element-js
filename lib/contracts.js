"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contracts = void 0;
var types_1 = require("./schema/types");
var abiPath = '../abi/';
var ElementSharedAsset = require(abiPath + "ElementSharedAsset.json");
var ElementixProxyRegistry = require(abiPath + "ElementixProxyRegistry.json");
var ElementixExchange = require(abiPath + "ElementixExchange.json");
var ExchangeHelper = require(abiPath + "ExchangeHelper.json");
var ERC20 = require(abiPath + "ERC20.json");
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
        this.tokenTransferProxyAddr = ElementixTokenTransferProxy.networks[networkID].address;
        if (exchangeHelperAddr && exchangeAddr && proxyRegistryAddr) {
            this.exchangeHelper = new web3.eth.Contract(ExchangeHelper.abi, exchangeHelperAddr, {
                gas: gasLimit
            });
            this.exchangeProxyRegistry = new web3.eth.Contract(ElementixProxyRegistry.abi, proxyRegistryAddr, {
                gas: gasLimit
            });
            this.erc20 = new web3.eth.Contract(ERC20.abi, {
                gas: gasLimit
            });
            this.exchange = new web3.eth.Contract(ElementixExchange.abi, exchangeAddr, {
                gas: gasLimit
            });
            this.elementSharedAsset = new web3.eth.Contract(ElementSharedAsset.abi, elementSharedAssetAddr, {
                gas: gasLimit
            });
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
