import { Asset, ComputedFees, OrderSide, UnhashedOrder, FeeMethod } from '../types';
/**
 * Compute the fees for an order
 * @param param0 __namedParameters
 * @param asset Asset to use for fees. May be blank ONLY for multi-collection bundles.
 * @param side The side of the order (buy or sell)
 * @param accountAddress The account to check fees for (useful if fees differ by account, like transfer fees)
 * @param isPrivate Whether the order is private or not (known taker)
 * @param extraBountyBasisPoints The basis points to add for the bounty. Will throw if it exceeds the assets' contract's Element fee.
 */
export declare function computeFees({ asset, side, accountAddress, isPrivate, extraBountyBasisPoints }: {
    asset?: Asset;
    side: OrderSide;
    accountAddress?: string;
    isPrivate?: boolean;
    extraBountyBasisPoints?: number;
}): ComputedFees;
export declare function _getBuyFeeParameters(totalBuyerFeeBasisPoints: number, totalSellerFeeBasisPoints: number, sellOrder?: UnhashedOrder): {
    makerRelayerFee: import("bignumber.js").default;
    takerRelayerFee: import("bignumber.js").default;
    makerProtocolFee: import("bignumber.js").default;
    takerProtocolFee: import("bignumber.js").default;
    makerReferrerFee: import("bignumber.js").default;
    feeRecipient: string;
    feeMethod: FeeMethod;
};
export declare function _getSellFeeParameters(totalBuyerFeeBasisPoints: number, totalSellerFeeBasisPoints: number, waitForHighestBid: boolean, sellerBountyBasisPoints?: number): {
    makerRelayerFee: import("bignumber.js").default;
    takerRelayerFee: import("bignumber.js").default;
    makerProtocolFee: import("bignumber.js").default;
    takerProtocolFee: import("bignumber.js").default;
    makerReferrerFee: import("bignumber.js").default;
    feeRecipient: string;
    feeMethod: FeeMethod;
};
/**
 * Validate fee parameters
 * @param totalBuyerFeeBasisPoints Total buyer fees
 * @param totalSellerFeeBasisPoints Total seller fees
 */
export declare function _validateFees(totalBuyerFeeBasisPoints: number, totalSellerFeeBasisPoints: number): void;
