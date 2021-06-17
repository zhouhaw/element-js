"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._validateFees = exports._getSellFeeParameters = exports._getBuyFeeParameters = exports.computeFees = void 0;
var helper_1 = require("./helper");
var constants_1 = require("./constants");
var types_1 = require("../types");
/**
 * Compute the fees for an order
 * @param param0 __namedParameters
 * @param asset Asset to use for fees. May be blank ONLY for multi-collection bundles.
 * @param side The side of the order (buy or sell)
 * @param accountAddress The account to check fees for (useful if fees differ by account, like transfer fees)
 * @param isPrivate Whether the order is private or not (known taker)
 * @param extraBountyBasisPoints The basis points to add for the bounty. Will throw if it exceeds the assets' contract's Element fee.
 */
function computeFees(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k;
    var asset = _a.asset, side = _a.side, accountAddress = _a.accountAddress, _l = _a.isPrivate, isPrivate = _l === void 0 ? false : _l, _m = _a.extraBountyBasisPoints, extraBountyBasisPoints = _m === void 0 ? 0 : _m;
    var elementBuyerFeeBasisPoints = constants_1.DEFAULT_BUYER_FEE_BASIS_POINTS;
    var elementSellerFeeBasisPoints = constants_1.DEFAULT_SELLER_FEE_BASIS_POINTS;
    var devBuyerFeeBasisPoints = 0;
    var devSellerFeeBasisPoints = 0;
    var transferFee = helper_1.makeBigNumber(0);
    var transferFeeTokenAddress = null;
    var maxTotalBountyBPS = constants_1.DEFAULT_MAX_BOUNTY;
    if (asset) {
        elementBuyerFeeBasisPoints += ((_b = asset === null || asset === void 0 ? void 0 : asset.collection) === null || _b === void 0 ? void 0 : _b.elementBuyerFeeBasisPoints) || 0;
        elementSellerFeeBasisPoints += ((_c = asset === null || asset === void 0 ? void 0 : asset.collection) === null || _c === void 0 ? void 0 : _c.elementSellerFeeBasisPoints) || 0;
        devBuyerFeeBasisPoints += ((_d = asset === null || asset === void 0 ? void 0 : asset.collection) === null || _d === void 0 ? void 0 : _d.devBuyerFeeBasisPoints) || 0;
        devSellerFeeBasisPoints += ((_e = asset === null || asset === void 0 ? void 0 : asset.collection) === null || _e === void 0 ? void 0 : _e.devSellerFeeBasisPoints) || 0;
        maxTotalBountyBPS = elementSellerFeeBasisPoints;
    }
    // Compute transferFrom fees
    if (side == types_1.OrderSide.Sell && asset) {
        // Server-side knowledge
        transferFee = ((_f = asset === null || asset === void 0 ? void 0 : asset.collection) === null || _f === void 0 ? void 0 : _f.transferFee)
            ? helper_1.makeBigNumber((_g = asset === null || asset === void 0 ? void 0 : asset.collection) === null || _g === void 0 ? void 0 : _g.transferFee)
            : transferFee;
        transferFeeTokenAddress = ((_h = asset === null || asset === void 0 ? void 0 : asset.collection) === null || _h === void 0 ? void 0 : _h.transferFeePaymentToken)
            ? (_k = (_j = asset === null || asset === void 0 ? void 0 : asset.collection) === null || _j === void 0 ? void 0 : _j.transferFeePaymentToken) === null || _k === void 0 ? void 0 : _k.address
            : transferFeeTokenAddress;
    }
    // Compute bounty
    var sellerBountyBasisPoints = side == types_1.OrderSide.Sell
        ? extraBountyBasisPoints
        : 0;
    // Check that bounty is in range of the element fee
    var bountyTooLarge = sellerBountyBasisPoints + constants_1.ELEMENT_SELLER_BOUNTY_BASIS_POINTS > maxTotalBountyBPS;
    if (sellerBountyBasisPoints > 0 && bountyTooLarge) {
        var errorMessage = "Total bounty exceeds the maximum for this asset type (" + maxTotalBountyBPS / 100 + "%).";
        if (maxTotalBountyBPS >= constants_1.ELEMENT_SELLER_BOUNTY_BASIS_POINTS) {
            errorMessage += " Remember that Element will add " + constants_1.ELEMENT_SELLER_BOUNTY_BASIS_POINTS / 100 + "% for referrers with OpenSea accounts!";
        }
        throw new Error(errorMessage);
    }
    // Remove fees for private orders
    if (isPrivate) {
        elementBuyerFeeBasisPoints = 0;
        elementSellerFeeBasisPoints = 0;
        devBuyerFeeBasisPoints = 0;
        devSellerFeeBasisPoints = 0;
        sellerBountyBasisPoints = 0;
    }
    return {
        totalBuyerFeeBasisPoints: elementBuyerFeeBasisPoints + devBuyerFeeBasisPoints,
        totalSellerFeeBasisPoints: elementSellerFeeBasisPoints + devSellerFeeBasisPoints,
        elementBuyerFeeBasisPoints: elementBuyerFeeBasisPoints,
        elementSellerFeeBasisPoints: elementSellerFeeBasisPoints,
        devBuyerFeeBasisPoints: devBuyerFeeBasisPoints,
        devSellerFeeBasisPoints: devSellerFeeBasisPoints,
        sellerBountyBasisPoints: sellerBountyBasisPoints,
        transferFee: transferFee,
        transferFeeTokenAddress: transferFeeTokenAddress
    };
}
exports.computeFees = computeFees;
function _getBuyFeeParameters(totalBuyerFeeBasisPoints, totalSellerFeeBasisPoints, sellOrder) {
    _validateFees(totalBuyerFeeBasisPoints, totalSellerFeeBasisPoints);
    var makerRelayerFee;
    var takerRelayerFee;
    if (sellOrder) {
        // Use the sell order's fees to ensure compatiblity and force the order
        // to only be acceptable by the sell order maker.
        // Swap maker/taker depending on whether it's an English auction (taker)
        // TODO add extraBountyBasisPoints when making bidder bounties
        makerRelayerFee = sellOrder.waitingForBestCounterOrder
            ? helper_1.makeBigNumber(sellOrder.makerRelayerFee)
            : helper_1.makeBigNumber(sellOrder.takerRelayerFee);
        takerRelayerFee = sellOrder.waitingForBestCounterOrder
            ? helper_1.makeBigNumber(sellOrder.takerRelayerFee)
            : helper_1.makeBigNumber(sellOrder.makerRelayerFee);
    }
    else {
        makerRelayerFee = helper_1.makeBigNumber(totalBuyerFeeBasisPoints);
        takerRelayerFee = helper_1.makeBigNumber(totalSellerFeeBasisPoints);
    }
    return {
        makerRelayerFee: makerRelayerFee,
        takerRelayerFee: takerRelayerFee,
        makerProtocolFee: helper_1.makeBigNumber(0),
        takerProtocolFee: helper_1.makeBigNumber(0),
        makerReferrerFee: helper_1.makeBigNumber(0),
        feeRecipient: constants_1.ELEMENT_FEE_RECIPIENT,
        feeMethod: types_1.FeeMethod.SplitFee
    };
}
exports._getBuyFeeParameters = _getBuyFeeParameters;
// waitForHighestBid true 英式拍卖
function _getSellFeeParameters(totalBuyerFeeBasisPoints, totalSellerFeeBasisPoints, waitForHighestBid, sellerBountyBasisPoints) {
    if (sellerBountyBasisPoints === void 0) { sellerBountyBasisPoints = 0; }
    _validateFees(totalBuyerFeeBasisPoints, totalSellerFeeBasisPoints);
    // waitForHighestBid = false
    // Use buyer as the maker when it's an English auction, so Wyvern sets prices correctly
    var feeRecipient = waitForHighestBid
        ? constants_1.NULL_ADDRESS
        : constants_1.ELEMENT_FEE_RECIPIENT;
    // Swap maker/taker fees when it's an English auction,
    // since these sell orders are takers not makers
    var makerRelayerFee = waitForHighestBid
        ? helper_1.makeBigNumber(totalBuyerFeeBasisPoints)
        : helper_1.makeBigNumber(totalSellerFeeBasisPoints);
    var takerRelayerFee = waitForHighestBid
        ? helper_1.makeBigNumber(totalSellerFeeBasisPoints)
        : helper_1.makeBigNumber(totalBuyerFeeBasisPoints);
    return {
        makerRelayerFee: makerRelayerFee,
        takerRelayerFee: takerRelayerFee,
        makerProtocolFee: helper_1.makeBigNumber(0),
        takerProtocolFee: helper_1.makeBigNumber(0),
        makerReferrerFee: helper_1.makeBigNumber(sellerBountyBasisPoints),
        feeRecipient: feeRecipient,
        feeMethod: types_1.FeeMethod.SplitFee
    };
}
exports._getSellFeeParameters = _getSellFeeParameters;
/**
 * Validate fee parameters
 * @param totalBuyerFeeBasisPoints Total buyer fees
 * @param totalSellerFeeBasisPoints Total seller fees
 */
function _validateFees(totalBuyerFeeBasisPoints, totalSellerFeeBasisPoints) {
    var maxFeePercent = constants_1.INVERSE_BASIS_POINT / 100;
    if (totalBuyerFeeBasisPoints > constants_1.INVERSE_BASIS_POINT
        || totalSellerFeeBasisPoints > constants_1.INVERSE_BASIS_POINT) {
        throw new Error("Invalid buyer/seller fees: must be less than " + maxFeePercent + "%");
    }
    if (totalBuyerFeeBasisPoints < 0
        || totalSellerFeeBasisPoints < 0) {
        throw new Error("Invalid buyer/seller fees: must be at least 0%");
    }
}
exports._validateFees = _validateFees;
