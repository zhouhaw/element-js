import { Asset, Order, OrderJSON } from './types';
import { Contracts } from './contracts';
export declare enum OrderCheckStatus {
    StartOrderHashSign = "startOrderHashSign",
    EndOrderHashSign = "endOrderHashSign",
    StartOrderMatch = "startOrderMatch",
    EndOrderMatch = "endOrderMatch"
}
export interface CallBack {
    next<T>(arg: T): OrderCheckStatus;
}
export declare class Orders extends Contracts {
    matchOrder({ buy, sell, accountAddress, metadata }: {
        buy: Order;
        sell: Order;
        accountAddress: string;
        metadata?: string;
    }, callBack?: CallBack): Promise<boolean>;
    createBuyOrder({ asset, accountAddress, startAmount, quantity, expirationTime, paymentTokenAddress, sellOrder, referrerAddress }: {
        asset: Asset;
        accountAddress: string;
        startAmount: number;
        quantity?: number;
        expirationTime?: number;
        paymentTokenAddress?: string;
        sellOrder?: Order;
        referrerAddress?: string;
    }, callBack?: CallBack): Promise<OrderJSON | boolean>;
    createSellOrder({ asset, accountAddress, startAmount, endAmount, quantity, listingTime, expirationTime, waitForHighestBid, englishAuctionReservePrice, paymentTokenAddress, extraBountyBasisPoints, buyerAddress, buyerEmail }: {
        asset: Asset;
        accountAddress: string;
        startAmount: number;
        endAmount?: number;
        quantity?: number;
        listingTime?: number;
        expirationTime?: number;
        waitForHighestBid?: boolean;
        englishAuctionReservePrice?: number;
        paymentTokenAddress?: string;
        extraBountyBasisPoints?: number;
        buyerAddress?: string;
        buyerEmail?: string;
    }, callBack?: CallBack): Promise<OrderJSON | boolean>;
    cancelOrder({ order, accountAddress }: {
        order: Order;
        accountAddress: string;
    }): Promise<boolean>;
}
