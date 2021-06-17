import { Asset, Order, OrderJSON } from './types';
import { Contracts } from './contracts';
export declare enum OrderCheckStatus {
    StartOrderHashSign = "startOrderHashSign",
    EndOrderHashSign = "endOrderHashSign",
    StartOrderMatch = "startOrderMatch",
    EndOrderMatch = "endOrderMatch",
    End = "End"
}
export interface CallBack {
    next<T>(arg: OrderCheckStatus): OrderCheckStatus;
}
export declare class Orders extends Contracts {
    fulfillOrder({ signedOrder, accountAddress, recipientAddress }: {
        signedOrder: Order;
        accountAddress: string;
        recipientAddress?: string;
    }): Promise<boolean>;
    orderMatch({ buy, sell, accountAddress, metadata }: {
        buy: Order;
        sell: Order;
        accountAddress: string;
        metadata?: string;
    }, callBack?: CallBack): Promise<boolean>;
    createBuyOrder({ asset, accountAddress, startAmount, quantity, expirationTime, paymentTokenAddress, sellOrder, referrerAddress, feeRecipient }: {
        asset: Asset;
        accountAddress: string;
        startAmount: number;
        quantity?: number;
        expirationTime?: number;
        paymentTokenAddress?: string;
        sellOrder?: Order;
        referrerAddress?: string;
        feeRecipient?: string;
    }, callBack?: CallBack): Promise<OrderJSON | boolean>;
    createSellOrder({ asset, accountAddress, startAmount, endAmount, quantity, listingTime, expirationTime, waitForHighestBid, englishAuctionReservePrice, paymentTokenAddress, extraBountyBasisPoints, feeRecipient, buyerAddress, buyerEmail }: {
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
        feeRecipient?: string;
        buyerAddress?: string;
        buyerEmail?: string;
    }, callBack?: CallBack): Promise<OrderJSON | boolean>;
    cancelOrder({ order, accountAddress }: {
        order: Order;
        accountAddress: string;
    }): Promise<boolean>;
}
