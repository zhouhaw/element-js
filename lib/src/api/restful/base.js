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
exports.Fetch = void 0;
var isomorphic_unfetch_1 = __importDefault(require("isomorphic-unfetch"));
var fetch;
if (typeof window === 'undefined') {
    fetch = isomorphic_unfetch_1.default;
}
else {
    fetch = window.fetch.bind(window);
}
var Fetch = /** @class */ (function () {
    function Fetch(url, logger) {
        this.apiBaseUrl = url;
        this.authToken = '';
        // Debugging: default to nothing
        this.logger = logger || (function (arg) { return arg; });
    }
    /**
     * Get JSON data from API, sending auth token in headers
     * @param apiPath Path to URL endpoint under API
     * @param query Data to send. Will be stringified using QueryString
     */
    Fetch.prototype.get = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._fetch(url)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.json()];
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
    Fetch.prototype.post = function (apiPath, body, opts) {
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
     * PUT JSON data to API, sending auth token in headers
     * @param apiPath Path to URL endpoint under API
     * @param body Data to send
     * @param opts RequestInit opts, similar to Fetch API. If it contains
     *  a body, it won't be stringified.
     */
    Fetch.prototype.put = function (apiPath, body, opts) {
        if (opts === void 0) { opts = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.post(apiPath, body, __assign({ method: 'PUT' }, opts))];
            });
        });
    };
    /**
     * Get from an API Endpoint, sending auth token in headers
     * @param apiPath Path to URL endpoint under API
     * @param opts RequestInit opts, similar to Fetch API
     */
    Fetch.prototype._fetch = function (apiPath, opts) {
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
                return [2 /*return*/, fetch(finalUrl, finalOpts).then(function (res) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/, this._handleApiResponse(res)];
                    }); }); })];
            });
        });
    };
    Fetch.prototype._handleApiResponse = function (response) {
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
    Fetch.prototype.throwOrContinue = function (error, retries) {
        var isUnavailable = !!error.message && (error.message.includes('503') || error.message.includes('429'));
        if (retries <= 0 || !isUnavailable) {
            throw error;
        }
    };
    return Fetch;
}());
exports.Fetch = Fetch;
