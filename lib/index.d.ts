import { Asset, Network, Order, OrderJSON, UnhashedOrder, ElementSchemaName } from './types';
import { getTokenList } from './utils';
import { Contracts } from "./contracts";
export { ElementSchemaName, Network, getTokenList };
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
    _makeBuyOrder({ asset, quantity, accountAddress, startAmount, expirationTime, paymentTokenAddress, extraBountyBasisPoints, sellOrder, referrerAddress }: {
        asset: Asset;
        quantity: number;
        accountAddress: string;
        startAmount: number;
        expirationTime: number;
        paymentTokenAddress: string;
        extraBountyBasisPoints: number;
        sellOrder?: Order;
        referrerAddress?: string;
    }): Promise<UnhashedOrder>;
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
    _makeSellOrder({ asset, quantity, accountAddress, startAmount, endAmount, listingTime, expirationTime, waitForHighestBid, englishAuctionReservePrice, paymentTokenAddress, extraBountyBasisPoints, buyerAddress }: {
        asset: Asset;
        quantity: number;
        accountAddress: string;
        startAmount: number;
        endAmount?: number;
        waitForHighestBid: boolean;
        englishAuctionReservePrice?: number;
        listingTime?: number;
        expirationTime: number;
        paymentTokenAddress: string;
        extraBountyBasisPoints: number;
        buyerAddress: string;
    }): Promise<UnhashedOrder>;
}
