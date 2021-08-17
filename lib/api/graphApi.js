"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphAPI = void 0;
var graphql_request_1 = require("graphql-request");
var index_1 = require("../index");
var constants_1 = require("../utils/constants");
var GraphAPI = /** @class */ (function () {
    /**
     * Create an instance of the OpenSea API
     * @param config OpenSeaAPIConfig for setting up the API, including an optional API key, network name, and base URL
     * @param logger Optional function for logging debug strings before and after requests are made
     */
    function GraphAPI(config, logger) {
        // this.apiKey = config.apiKey
        switch (config.networkName) {
            case index_1.Network.Rinkeby:
                this.graphqlUrl = config.apiBaseUrl || constants_1.ORDERBOOK_PATH.rinkeby;
                break;
            case index_1.Network.Main:
                this.graphqlUrl = config.apiBaseUrl || constants_1.ORDERBOOK_PATH.main;
                break;
            default:
                this.graphqlUrl = config.apiBaseUrl || constants_1.ORDERBOOK_PATH.main;
                break;
        }
        // Debugging: default to nothing
        this.logger = logger || (function (arg) { return arg; });
    }
    GraphAPI.prototype.getNewNonce = function (walletProvider) {
        return __awaiter(this, void 0, void 0, function () {
            var accountAddress, endpoint, getNonce, variables, nonce;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        accountAddress = walletProvider.eth.defaultAccount;
                        endpoint = this.graphqlUrl;
                        getNonce = graphql_request_1.gql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n      query GetNonce($address: Address!, $chain: Chain!, $chainId: ChainId!) {\n        user(identity: { address: $address, blockChain: { chain: $chain, chainId: $chainId } }) {\n          nonce\n        }\n      }\n    "], ["\n      query GetNonce($address: Address!, $chain: Chain!, $chainId: ChainId!) {\n        user(identity: { address: $address, blockChain: { chain: $chain, chainId: $chainId } }) {\n          nonce\n        }\n      }\n    "])));
                        variables = {
                            address: accountAddress,
                            chain: 'eth',
                            chainId: '0x1'
                        };
                        return [4 /*yield*/, graphql_request_1.request(endpoint, getNonce, variables)];
                    case 1:
                        nonce = _a.sent();
                        console.log(nonce);
                        return [2 /*return*/, nonce.user.nonce];
                }
            });
        });
    };
    GraphAPI.prototype.getSignInToken = function (walletProvider) {
        return __awaiter(this, void 0, void 0, function () {
            var accountAddress, endpoint, nonce, _a, message, signature, loginAuth, loginVar, token;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        accountAddress = walletProvider.eth.defaultAccount;
                        endpoint = this.graphqlUrl;
                        return [4 /*yield*/, this.getNewNonce(walletProvider)];
                    case 1:
                        nonce = _b.sent();
                        return [4 /*yield*/, index_1.elementSignInSign(walletProvider, nonce, accountAddress)];
                    case 2:
                        _a = _b.sent(), message = _a.message, signature = _a.signature;
                        loginAuth = graphql_request_1.gql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n      mutation LoginAuth($identity: IdentityInput!, $message: String!, $signature: String!) {\n        auth {\n          login(input: { identity: $identity, message: $message, signature: $signature }) {\n            token\n          }\n        }\n      }\n    "], ["\n      mutation LoginAuth($identity: IdentityInput!, $message: String!, $signature: String!) {\n        auth {\n          login(input: { identity: $identity, message: $message, signature: $signature }) {\n            token\n          }\n        }\n      }\n    "])));
                        loginVar = {
                            identity: {
                                address: accountAddress,
                                blockChain: {
                                    chain: 'eth',
                                    chainId: '0x1'
                                }
                            },
                            message: message,
                            signature: signature
                        };
                        return [4 /*yield*/, graphql_request_1.request(endpoint, loginAuth, loginVar)];
                    case 3:
                        token = _b.sent();
                        console.log(token);
                        return [2 /*return*/];
                }
            });
        });
    };
    return GraphAPI;
}());
exports.GraphAPI = GraphAPI;
var templateObject_1, templateObject_2;
