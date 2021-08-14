"use strict";
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
exports.orderFromJSON = exports.Sleep = void 0;
var constants_1 = require("./constants");
function Sleep(ms) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    setTimeout(function () {
                        resolve({ status: 'wakeUp' });
                    }, ms);
                })];
        });
    });
}
exports.Sleep = Sleep;
var orderFromJSON = function (order) {
    var createdDate = new Date(); // `${order.created_date}Z`
    var fromJSON = {
        hash: order.hash,
        cancelledOrFinalized: order.cancelled || order.finalized,
        markedInvalid: order.marked_invalid,
        metadata: order.metadata,
        quantity: new constants_1.BigNumber(order.quantity || 1),
        exchange: order.exchange,
        makerAccount: order.maker,
        takerAccount: order.taker,
        // Use string address to conform to Element Order schema
        maker: order.maker,
        taker: order.taker,
        makerRelayerFee: new constants_1.BigNumber(order.makerRelayerFee),
        takerRelayerFee: new constants_1.BigNumber(order.takerRelayerFee),
        makerProtocolFee: new constants_1.BigNumber(order.makerProtocolFee),
        takerProtocolFee: new constants_1.BigNumber(order.takerProtocolFee),
        makerReferrerFee: new constants_1.BigNumber(order.makerReferrerFee || 0),
        waitingForBestCounterOrder: order.feeRecipient == constants_1.NULL_ADDRESS,
        feeMethod: order.feeMethod,
        feeRecipientAccount: order.feeRecipient,
        feeRecipient: order.feeRecipient,
        side: order.side,
        saleKind: order.saleKind,
        target: order.target,
        howToCall: order.howToCall,
        dataToCall: order.dataToCall,
        replacementPattern: order.replacementPattern,
        staticTarget: order.staticTarget,
        staticExtradata: order.staticExtradata,
        paymentToken: order.paymentToken,
        basePrice: new constants_1.BigNumber(order.basePrice),
        extra: new constants_1.BigNumber(order.extra),
        currentBounty: new constants_1.BigNumber(order.currentBounty || 0),
        currentPrice: new constants_1.BigNumber(order.currentPrice || 0),
        createdTime: new constants_1.BigNumber(Math.round(createdDate.getTime() / 1000)),
        listingTime: new constants_1.BigNumber(order.listingTime),
        expirationTime: new constants_1.BigNumber(order.expirationTime),
        salt: new constants_1.BigNumber(order.salt),
        v: Number.parseInt(order.v),
        r: order.r,
        s: order.s,
        paymentTokenContract: order.paymentToken || undefined,
        asset: order.asset || undefined,
        assetBundle: order.assetBundle || undefined
    };
    // Use client-side price calc, to account for buyer fee (not added by server) and latency
    // fromJSON.currentPrice = estimateCurrentPrice(fromJSON)
    return fromJSON;
};
exports.orderFromJSON = orderFromJSON;
