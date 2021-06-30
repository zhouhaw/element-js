import { Asset, ECSignature, ElementAsset, ElementSchemaName, Network, Order, OrderJSON, OrderSide, UnhashedOrder, UnsignedOrder } from '../types';
import { Schema, Token } from '../schema/types';
import { BigNumber } from './constants';
export declare function getSchema(network: Network, schemaName: ElementSchemaName): Schema<any>;
export declare function getElementAsset(schema: Schema<ElementAsset>, asset: Asset, quantity?: BigNumber): ElementAsset;
export declare function getSchemaAndAsset(networkName: Network, asset: Asset, quantity: number): {
    schema: Schema<any>;
    elementAsset: ElementAsset;
    quantityBN: BigNumber;
};
export declare function generatePseudoRandomSalt(): BigNumber;
export declare function getPriceParameters(network: Network, orderSide: OrderSide, paymentTokenObj: Token, expirationTime: number, startAmount: number, endAmount?: number, waitingForBestCounterOrder?: boolean, englishAuctionReservePrice?: number): {
    basePrice: BigNumber;
    extra: BigNumber;
    paymentToken: string;
    reservePrice: BigNumber | undefined;
};
export declare function getTimeParameters(expirationTimestamp: number, listingTimestamp?: number, waitingForBestCounterOrder?: boolean): {
    listingTime: BigNumber;
    expirationTime: BigNumber;
};
export declare function _makeBuyOrder({ networkName, exchangeAddr, asset, quantity, accountAddress, startAmount, expirationTime, paymentTokenObj, extraBountyBasisPoints, feeRecipientAddr, sellOrder, referrerAddress }: {
    networkName: Network;
    exchangeAddr: string;
    asset: Asset;
    quantity: number;
    accountAddress: string;
    startAmount: number;
    expirationTime: number;
    paymentTokenObj: Token;
    extraBountyBasisPoints: number;
    feeRecipientAddr: string;
    sellOrder?: Order;
    referrerAddress?: string;
}): Promise<UnhashedOrder>;
export declare function _makeSellOrder({ networkName, exchangeAddr, asset, quantity, accountAddress, startAmount, endAmount, listingTime, expirationTime, waitForHighestBid, englishAuctionReservePrice, paymentTokenObj, extraBountyBasisPoints, feeRecipientAddr, buyerAddress }: {
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
    paymentTokenObj: Token;
    extraBountyBasisPoints: number;
    feeRecipientAddr: string;
    buyerAddress: string;
}): Promise<UnhashedOrder>;
export declare function getOrderHash(web3: any, exchangeHelper: any, order: UnhashedOrder): Promise<string>;
export declare function hashAndValidateOrder(web3: any, exchangeHelper: any, order: UnhashedOrder): Promise<any>;
export declare function signOrderHash(web3: any, hashedOrder: UnsignedOrder): Promise<ECSignature>;
export declare const orderToJSON: (order: Order) => OrderJSON;
export declare function schemaEncodeSell(network: Network, schema: ElementSchemaName, owner: string, data: any): {
    target: string;
    dataToCall: string;
    replacementPattern: string;
};
export declare function getCurrentPrice(exchangeHelper: any, order: Order): Promise<string>;
export declare function _getStaticCallTargetAndExtraData({ networkName, asset, useTxnOriginStaticCall }: {
    networkName: Network;
    asset: Asset;
    useTxnOriginStaticCall: boolean;
}): Promise<{
    staticTarget: string;
    staticExtradata: string;
}>;
export declare function _makeMatchingOrder({ networkName, signedOrder, accountAddress, assetRecipientAddress, feeRecipientAddress }: {
    networkName: Network;
    signedOrder: UnsignedOrder;
    accountAddress: string;
    assetRecipientAddress: string;
    feeRecipientAddress: string;
}): UnhashedOrder;
/**
 * Assign an order and a new matching order to their buy/sell sides
 * @param order Original order
 * @param matchingOrder The result of _makeMatchingOrder
 */
export declare function assignOrdersToSides(order: Order, matchingOrder: UnsignedOrder): {
    buy: Order;
    sell: Order;
};
