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
exports.OrdersAPI = void 0;
var isomorphic_unfetch_1 = __importDefault(require("isomorphic-unfetch"));
var utils_1 = require("../utils");
var graphqlApi_1 = require("./graphqlApi");
var OrdersAPI = /** @class */ (function (_super) {
    __extends(OrdersAPI, _super);
    function OrdersAPI(config, logger) {
        var _this = _super.call(this, config, logger) || this;
        /**
         * Page size to use for fetching orders
         */
        _this.pageSize = 20;
        // Debugging: default to nothing
        _this.logger = logger || (function (arg) { return arg; });
        return _this;
    }
    /**
     * Send an order to the orderbook.
     * Throws when the order is invalid.
     * IN NEXT VERSION: change order input to Order type
     * @param order Order JSON to post to the orderbook
     * @param retries Number of times to retry if the service is unavailable for any reason
     */
    OrdersAPI.prototype.ordersPost = function (_a) {
        var order = _a.order, _b = _a.retries, retries = _b === void 0 ? 2 : _b;
        return __awaiter(this, void 0, void 0, function () {
            var json, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 4]);
                        return [4 /*yield*/, this.post("/v1/orders/post", order)];
                    case 1:
                        //X-Viewer-Addr
                        json = (_c.sent());
                        return [3 /*break*/, 4];
                    case 2:
                        error_1 = _c.sent();
                        _throwOrContinue(error_1, retries);
                        return [4 /*yield*/, utils_1.Sleep(3000)];
                    case 3:
                        _c.sent();
                        return [2 /*return*/, this.ordersPost({ order: order, retries: retries - 1 })];
                    case 4: return [2 /*return*/, json];
                }
            });
        });
    };
    OrdersAPI.prototype.ordersVersion = function (orderAsset, retries) {
        if (retries === void 0) { retries = 2; }
        return __awaiter(this, void 0, void 0, function () {
            var json, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 4]);
                        return [4 /*yield*/, this.post("/v1/orders/orderVersionQuery", orderAsset)];
                    case 1:
                        json = (_a.sent());
                        return [3 /*break*/, 4];
                    case 2:
                        error_2 = _a.sent();
                        _throwOrContinue(error_2, retries);
                        return [4 /*yield*/, utils_1.Sleep(3000)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, this.ordersVersion(orderAsset, retries - 1)];
                    case 4: return [2 /*return*/, json];
                }
            });
        });
    };
    OrdersAPI.prototype.ordersConfData = function (retries) {
        if (retries === void 0) { retries = 2; }
        return __awaiter(this, void 0, void 0, function () {
            var json, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 4]);
                        return [4 /*yield*/, this.post("/v1/orders/confData")];
                    case 1:
                        json = (_a.sent());
                        return [3 /*break*/, 4];
                    case 2:
                        error_3 = _a.sent();
                        _throwOrContinue(error_3, retries);
                        return [4 /*yield*/, utils_1.Sleep(3000)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, this.ordersConfData(retries - 1)];
                    case 4: return [2 /*return*/, json];
                }
            });
        });
    };
    OrdersAPI.prototype.ordersCancel = function (cancelParams, retries) {
        if (retries === void 0) { retries = 2; }
        return __awaiter(this, void 0, void 0, function () {
            var json, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 4]);
                        return [4 /*yield*/, this.post("/v1/orders/cancel", cancelParams)];
                    case 1:
                        json = _a.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        error_4 = _a.sent();
                        _throwOrContinue(error_4, retries);
                        return [4 /*yield*/, utils_1.Sleep(3000)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, this.ordersCancel(cancelParams, retries - 1)];
                    case 4: return [2 /*return*/, json];
                }
            });
        });
    };
    OrdersAPI.prototype.ordersQuery = function (queryParams, retries) {
        if (retries === void 0) { retries = 2; }
        return __awaiter(this, void 0, void 0, function () {
            var json, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 4]);
                        return [4 /*yield*/, this.post("/v1/orders/query", queryParams)];
                    case 1:
                        json = _a.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        error_5 = _a.sent();
                        _throwOrContinue(error_5, retries);
                        return [4 /*yield*/, utils_1.Sleep(3000)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, this.ordersQuery(queryParams, retries - 1)];
                    case 4: return [2 /*return*/, json];
                }
            });
        });
    };
    /**
     * POST JSON data to API, sending auth token in headers
     * @param apiPath Path to URL endpoint under API
     * @param body Data to send. Will be JSON.stringified
     * @param opts RequestInit opts, similar to Fetch API. If it contains
     *  a body, it won't be stringified.
     */
    OrdersAPI.prototype.post = function (apiPath, body, opts) {
        if (opts === void 0) { opts = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var fetchOpts, response, resJson;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fetchOpts = __assign({ method: 'POST', body: body ? JSON.stringify(body) : undefined, headers: {
                                Accept: 'application/json',
                                'Content-Type': 'application/json'
                            } }, opts);
                        return [4 /*yield*/, this._fetch(apiPath, fetchOpts)];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.json()];
                    case 2:
                        resJson = _a.sent();
                        if (resJson.data) {
                            return [2 /*return*/, resJson.data];
                        }
                        else {
                            return [2 /*return*/, resJson];
                        }
                        return [3 /*break*/, 4];
                    case 3: return [2 /*return*/, response];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get from an API Endpoint, sending auth token in headers
     * @param apiPath Path to URL endpoint under API
     * @param opts RequestInit opts, similar to Fetch API
     */
    OrdersAPI.prototype._fetch = function (apiPath, opts) {
        if (opts === void 0) { opts = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var apiBase, token, finalUrl, finalOpts;
            var _this = this;
            return __generator(this, function (_a) {
                apiBase = this.apiBaseUrl;
                token = this.authToken;
                finalUrl = apiBase + apiPath;
                finalOpts = __assign(__assign({}, opts), { headers: __assign(__assign({}, (token ? { Authorization: token } : {})), (opts.headers || {})) });
                this.logger("Sending request: " + finalUrl + " " + JSON.stringify(finalOpts).substr(0, 100) + "...");
                return [2 /*return*/, isomorphic_unfetch_1.default(finalUrl, finalOpts).then(function (res) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/, this._handleApiResponse(res)];
                    }); }); })];
            });
        });
    };
    OrdersAPI.prototype._handleApiResponse = function (response) {
        return __awaiter(this, void 0, void 0, function () {
            var result, errorMessage, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (response.ok) {
                            this.logger("Got success: " + response.status);
                            return [2 /*return*/, response];
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, response.text()];
                    case 2:
                        result = _b.sent();
                        result = JSON.parse(result);
                        return [3 /*break*/, 4];
                    case 3:
                        _a = _b.sent();
                        return [3 /*break*/, 4];
                    case 4:
                        this.logger("Got error " + response.status + ": " + JSON.stringify(result));
                        switch (response.status) {
                            case 400:
                                errorMessage = result && result.errors ? result.errors.join(', ') : "Invalid request: " + JSON.stringify(result);
                                break;
                            case 401:
                            case 403:
                                errorMessage = "Unauthorized. Full message was '" + JSON.stringify(result) + "'";
                                break;
                            case 404:
                                errorMessage = "Not found. Full message was '" + JSON.stringify(result) + "'";
                                break;
                            case 500:
                                errorMessage = "Internal server error. OpenSea has been alerted, but if the problem persists please contact us via Discord: https://discord.gg/ga8EJbv - full message was " + JSON.stringify(result);
                                break;
                            case 503:
                                errorMessage = "Service unavailable. Please try again in a few minutes. If the problem persists please contact us via Discord: https://discord.gg/ga8EJbv - full message was " + JSON.stringify(result);
                                break;
                            default:
                                errorMessage = "Message: " + JSON.stringify(result);
                                break;
                        }
                        throw new Error("API Error " + response.status + ": " + errorMessage);
                }
            });
        });
    };
    return OrdersAPI;
}(graphqlApi_1.GraphqlApi));
exports.OrdersAPI = OrdersAPI;
function _throwOrContinue(error, retries) {
    var isUnavailable = !!error.message && (error.message.includes('503') || error.message.includes('429'));
    if (retries <= 0 || !isUnavailable) {
        throw error;
    }
}
