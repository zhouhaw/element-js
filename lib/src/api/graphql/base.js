"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphqlApi = void 0;
var graphql_request_1 = require("graphql-request");
var hmac_sha256_1 = __importDefault(require("crypto-js/hmac-sha256"));
var config_1 = require("../config");
var GraphqlApi = /** @class */ (function () {
    /**
     * Create an instance of the Element API
     * @param config ElementAPIConfig for setting up the API, including an optional API key, network name, and base URL
     * @param logger Optional function for logging debug strings before and after requests are made
     */
    function GraphqlApi(config) {
        var _network = config.networkName;
        this.apiBaseUrl = config.apiBaseUrl || config_1.API_BASE_URL[_network].api;
        this.chainId = config_1.CHAIN_ID[_network];
        this.appKey = config_1.API_BASE_URL[_network].key;
        this.appSecret = config_1.API_BASE_URL[_network].secret;
        this.account = config.account || '';
        if (!this.apiBaseUrl) {
            throw new Error(_network + " undefined api");
        }
        this.chain = config_1.CHAIN[_network];
        this.walletChainId = "0x" + this.chainId.toString(16);
        this.networkName = _network;
        this.authToken = '';
        var getSign = this.getAPISign();
        this.gqlClient = new graphql_request_1.GraphQLClient(this.apiBaseUrl + "/graphql", { headers: __assign({}, getSign) });
        this.gqlClient = this.gqlClient.setHeader('X-Viewer-Addr', this.account);
    }
    /**
     * 访问限制
     * 添加API签名
     * X-Api-Key appKey
     * X-Api-Sign	验证签名
     */
    GraphqlApi.prototype.getAPISign = function () {
        // 随机数字字母，建议4位
        var nonce = Number.parseInt((Math.random() * (9999 - 1000 + 1) + 1000).toString(), 10);
        // 当前时间戳（秒）
        var timestamp = Number.parseInt((Date.now() / 1000).toString(), 10);
        // 使用appSecret进行HMacSha256加密函数
        var hmac256 = hmac_sha256_1.default("" + this.appKey + nonce + timestamp, this.appSecret);
        var headers = {
            'X-Api-Key': this.appKey,
            'X-Api-Sign': hmac256 + "." + nonce + "." + timestamp
        };
        return headers;
    };
    GraphqlApi.prototype.identityRequest = function (_a) {
        var funcName = _a.funcName, gql = _a.gql, params = _a.params;
        var variables = __assign(__assign({}, params), { identity: {
                blockChain: {
                    chain: this.chain,
                    chainId: this.walletChainId
                }
            } });
        this.gqlClient = this.gqlClient.setHeader('X-Query-Args', funcName);
        return this.gqlClient.request(gql, variables);
    };
    GraphqlApi.prototype.blockChainRequest = function (_a) {
        var funcName = _a.funcName, gql = _a.gql, params = _a.params;
        var variables = __assign(__assign({}, params), { blockChain: {
                chain: this.chain,
                chainId: this.walletChainId
            } });
        this.gqlClient = this.gqlClient.setHeader('X-Query-Args', funcName);
        return this.gqlClient.request(gql, variables);
    };
    return GraphqlApi;
}());
exports.GraphqlApi = GraphqlApi;
