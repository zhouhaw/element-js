import { Asset, Order, OrderJSON } from './types';
import { Contracts } from './contracts';
export declare class Orders extends Contracts {
    matchOrder({ asset, accountAddress, startAmount, quantity, expirationTime, paymentTokenAddress, sellOrder, referrerAddress }: {
        asset: Asset;
        accountAddress: string;
        startAmount: number;
        quantity?: number;
        expirationTime?: number;
        paymentTokenAddress?: string;
        sellOrder: Order;
        referrerAddress?: string;
    }): Promise<Order | boolean>;
    createBuyOrder({ asset, accountAddress, startAmount, quantity, expirationTime, paymentTokenAddress, sellOrder, referrerAddress }: {
        asset: Asset;
        accountAddress: string;
        startAmount: number;
        quantity?: number;
        expirationTime?: number;
        paymentTokenAddress?: string;
        sellOrder?: Order;
        referrerAddress?: string;
    }): Promise<OrderJSON | boolean>;
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
    }): Promise<OrderJSON | boolean>;
}
