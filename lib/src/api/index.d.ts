import { Asset, Network, Token } from '../index';
import { OrderVersionData, OrdersAPI, OrderCancelParams } from './ordersApi';
export declare enum MakeOrderType {
    FixPriceOrder = "FixPriceOrder",
    DutchAuctionOrder = "DutchAuctionOrder",
    EnglishAuctionOrder = "EnglishAuctionOrder",
    LowerPriceOrder = "LowerPriceOrder",
    MakeOfferOrder = "MakeOfferOrder",
    EnglishAuctionBiddingOrder = "EnglishAuctionBiddingOrder"
}
export interface TradeBestAskType {
    bestAskSaleKind: number;
    bestAskPrice: number;
    bestAskToken: string;
    bestAskPriceBase: number;
    bestAskPriceUSD: number;
    bestAskListingDate: string;
    bestAskExpirationDate: string;
    bestAskPriceCNY: number;
    bestAskCreatedDate: string;
    bestAskOrderString: string;
    bestAskOrderType: number;
    bestAskOrderQuantity: number;
    bestAskTokenContract: Token;
}
export interface CreateOrderParams {
    asset: Asset;
    quantity?: number;
    paymentToken?: Token;
}
export interface SellOrderParams extends CreateOrderParams {
    listingTime?: number;
    expirationTime?: number;
    startAmount: number;
    endAmount?: number;
    buyerAddress?: string;
}
export declare class ElementOrders extends OrdersAPI {
    orders: any;
    accountAddress: string;
    walletChainId: string;
    networkName: Network;
    chainName: string;
    chainId: number;
    constructor({ walletProvider, networkName, privateKey }: {
        walletProvider: any;
        networkName: Network;
        privateKey?: string;
    });
    ordersCancelSign(hash: string): Promise<OrderCancelParams>;
    getAssetOrderVersion(assetData: Asset): Promise<{
        orderVersion: OrderVersionData;
        newAsset: Asset;
    }>;
    createSellOrder({ asset, quantity, paymentToken, listingTime, expirationTime, startAmount, endAmount, buyerAddress }: SellOrderParams): Promise<any>;
}
