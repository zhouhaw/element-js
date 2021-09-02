import { Asset, Network, Token, CallBack } from '../index';
import { OrderVersionData, OrdersAPI, OrderCancelParams } from './ordersApi';
import { Account } from '../account';
import { GraphqlApi } from './graphqlApi';
import Web3 from 'web3';
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
    account: Account;
    gqlApi: GraphqlApi;
    walletProvider: Web3;
    accountAddress: string;
    constructor({ walletProvider, networkName, walletAccount, privateKey, authToken }: {
        walletProvider: any;
        networkName: Network;
        walletAccount?: string;
        privateKey?: string;
        authToken?: string;
    });
    getLoginAuthToken(): Promise<string>;
    ordersCancelSign(hash: string): Promise<OrderCancelParams>;
    getAssetOrderVersion(assetData: Asset): Promise<{
        orderVersion: OrderVersionData;
        newAsset: Asset;
    }>;
    createSellOrder({ asset, quantity, paymentToken, listingTime, expirationTime, startAmount, endAmount, buyerAddress }: SellOrderParams): Promise<any>;
    acceptOrder(bestAskOrder: any, callBack?: CallBack): Promise<any>;
}
