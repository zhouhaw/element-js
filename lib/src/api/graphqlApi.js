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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphqlApi = void 0;
var graphql_request_1 = require("graphql-request");
var hmac_sha256_1 = __importDefault(require("crypto-js/hmac-sha256"));
var config_1 = require("./config");
var user_1 = require("./gql/user");
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
    GraphqlApi.prototype.getNewNonce = function () {
        return __awaiter(this, void 0, void 0, function () {
            var variables, nonce;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        variables = {
                            address: this.account,
                            chain: this.chain,
                            chainId: this.walletChainId
                        };
                        return [4 /*yield*/, this.gqlClient.request(user_1.getNonce, variables)];
                    case 1:
                        nonce = _a.sent();
                        return [2 /*return*/, nonce.user.nonce];
                }
            });
        });
    };
    GraphqlApi.prototype.getSignInToken = function (_a) {
        var message = _a.message, signature = _a.signature;
        return __awaiter(this, void 0, void 0, function () {
            var loginVar, token, bearerToken;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        loginVar = {
                            identity: {
                                address: this.account,
                                blockChain: {
                                    chain: this.chain,
                                    chainId: this.walletChainId
                                }
                            },
                            message: message,
                            signature: signature
                        };
                        return [4 /*yield*/, this.gqlClient.request(user_1.loginAuth, loginVar)
                            // console.log(token.auth.login.token)
                        ];
                    case 1:
                        token = _b.sent();
                        bearerToken = "Bearer " + token.auth.login.token;
                        this.gqlClient = this.gqlClient.setHeader('Authorization', bearerToken);
                        this.authToken = bearerToken;
                        return [2 /*return*/, bearerToken];
                }
            });
        });
    };
    GraphqlApi.prototype.getUserAssetsList = function () {
        return __awaiter(this, void 0, void 0, function () {
            var variables;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        variables = {
                            first: 20,
                            identity: {
                                address: this.account,
                                blockChain: {
                                    chain: this.chain,
                                    chainId: this.walletChainId
                                }
                            }
                        };
                        this.gqlClient = this.gqlClient.setHeader('X-Query-Args', 'UserAssetsList');
                        return [4 /*yield*/, this.gqlClient.request(user_1.userAssetsList, variables)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    GraphqlApi.prototype.getAccountOrders = function () {
        return __awaiter(this, void 0, void 0, function () {
            var variables;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        variables = {
                            first: 20,
                            identity: {
                                address: this.account,
                                blockChain: {
                                    chain: this.chain,
                                    chainId: this.walletChainId
                                }
                            },
                            orderType: 0 //报价
                        };
                        this.gqlClient = this.gqlClient.setHeader('X-Query-Args', 'AccountOrders');
                        return [4 /*yield*/, this.gqlClient.request(user_1.accountOrders, variables)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return GraphqlApi;
}());
exports.GraphqlApi = GraphqlApi;
