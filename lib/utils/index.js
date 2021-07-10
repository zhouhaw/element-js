"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderFromJSON = void 0;
var constants_1 = require("./constants");
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
