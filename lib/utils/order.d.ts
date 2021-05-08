import { Asset, ElementAsset, ElementSchemaName, Network, Order, OrderSide, UnhashedOrder } from '../types';
import { Schema } from '../schema/types';
import BigNumber from 'bignumber.js';
export declare function makeBigNumber(arg: number | string | BigNumber): BigNumber;
export declare function getSchema(network: Network, schemaName?: ElementSchemaName): Schema<any>;
export declare function getElementAsset(schema: Schema<ElementAsset>, asset: Asset, quantity?: BigNumber): ElementAsset;
export declare function generatePseudoRandomSalt(): BigNumber;
export declare function getPriceParameters(network: Network, orderSide: OrderSide, tokenAddress: string, expirationTime: number, startAmount: number, endAmount?: number, waitingForBestCounterOrder?: boolean, englishAuctionReservePrice?: number): {
    basePrice: BigNumber;
    extra: BigNumber;
    paymentToken: string;
    reservePrice: number | undefined;
};
export declare function getTimeParameters(expirationTimestamp: number, listingTimestamp?: number, waitingForBestCounterOrder?: boolean): {
    listingTime: BigNumber;
    expirationTime: BigNumber;
};
export declare function _makeBuyOrder({ networkName, exchangeAddr, asset, quantity, accountAddress, startAmount, expirationTime, paymentTokenAddress, extraBountyBasisPoints, sellOrder, referrerAddress }: {
    networkName: Network;
    exchangeAddr: string;
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
export declare function _makeSellOrder({ networkName, exchangeAddr, asset, quantity, accountAddress, startAmount, endAmount, listingTime, expirationTime, waitForHighestBid, englishAuctionReservePrice, paymentTokenAddress, extraBountyBasisPoints, buyerAddress }: {
    networkName: Network;
    exchangeAddr: string;
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
