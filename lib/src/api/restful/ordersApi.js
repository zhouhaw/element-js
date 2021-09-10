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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersAPI = void 0;
var utils_1 = require("../../utils");
var config_1 = require("../config");
var base_1 = require("./base");
var OrdersAPI = /** @class */ (function (_super) {
    __extends(OrdersAPI, _super);
    function OrdersAPI(config, logger) {
        var _this = _super.call(this, config.apiBaseUrl || config_1.API_BASE_URL[config.networkName].api, logger) || this;
        /**
         * Page size to use for fetching orders
         */
        _this.pageSize = 20;
        var _network = config.networkName;
        _this.authToken = config.authToken || '';
        _this.chain = config_1.CHAIN[_network];
        _this.chainId = config_1.CHAIN_ID[_network];
        _this.walletChainId = "0x" + _this.chainId.toString(16);
        _this.chainInfo = {
            chain: config_1.CHAIN[_network],
            chainId: _this.walletChainId
        };
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
                        return [4 /*yield*/, this.post("/v1/orders/post", __assign(__assign({}, order), this.chainInfo))];
                    case 1:
                        //X-Viewer-Addr
                        json = (_c.sent());
                        return [3 /*break*/, 4];
                    case 2:
                        error_1 = _c.sent();
                        this.throwOrContinue(error_1, retries);
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
                        return [4 /*yield*/, this.post("/v1/orders/orderVersionQuery", __assign(__assign({}, orderAsset), this.chainInfo))];
                    case 1:
                        json = (_a.sent());
                        return [3 /*break*/, 4];
                    case 2:
                        error_2 = _a.sent();
                        this.throwOrContinue(error_2, retries);
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
                        return [4 /*yield*/, this.post("/v1/orders/confData", this.chainInfo)];
                    case 1:
                        json = (_a.sent());
                        return [3 /*break*/, 4];
                    case 2:
                        error_3 = _a.sent();
                        this.throwOrContinue(error_3, retries);
                        return [4 /*yield*/, utils_1.Sleep(3000)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, this.ordersConfData(retries - 1)];
                    case 4: return [2 /*return*/, json];
                }
            });
        });
    };
    OrdersAPI.prototype.ordersHidden = function (cancelParams, retries) {
        if (retries === void 0) { retries = 2; }
        return __awaiter(this, void 0, void 0, function () {
            var json, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 4]);
                        return [4 /*yield*/, this.post("/v1/orders/cancel", __assign(__assign({}, cancelParams), this.chainInfo))];
                    case 1:
                        json = _a.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        error_4 = _a.sent();
                        this.throwOrContinue(error_4, retries);
                        return [4 /*yield*/, utils_1.Sleep(3000)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, this.ordersHidden(cancelParams, retries - 1)];
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
                        return [4 /*yield*/, this.post("/v1/orders/query", __assign(__assign({}, queryParams), this.chainInfo))];
                    case 1:
                        json = _a.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        error_5 = _a.sent();
                        this.throwOrContinue(error_5, retries);
                        return [4 /*yield*/, utils_1.Sleep(3000)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, this.ordersQuery(queryParams, retries - 1)];
                    case 4: return [2 /*return*/, json];
                }
            });
        });
    };
    return OrdersAPI;
}(base_1.Fetch));
exports.OrdersAPI = OrdersAPI;
