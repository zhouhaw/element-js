import { Asset, Network, OrderJSON, Order } from '../../index';
import { OrderVersionData, OrdersAPI, OrderCancelParams } from './restful/ordersApi';
import { Account } from '../account';
import { UsersApi, AssetsApi } from './graphql';
import Web3 from 'web3';
import { BuyOrderParams, SellOrderParams, EnglishAuctionOrderParams, BiddingOrderParams } from './types';
export type { BuyOrderParams, SellOrderParams, EnglishAuctionOrderParams, BiddingOrderParams };
export declare class ElementOrders extends OrdersAPI {
    orders: any;
    account: Account;
    gqlApi: {
        usersApi: UsersApi;
        assetsApi: AssetsApi;
    };
    walletProvider: Web3;
    accountAddress: string;
    constructor({ walletProvider, networkName, walletAccount, privateKey, authToken, apiBaseUrl }: {
        walletProvider: any;
        networkName: Network;
        walletAccount?: string;
        privateKey?: string;
        authToken?: string;
        apiBaseUrl?: string;
    });
    getLoginAuthToken(): Promise<string>;
    login(): Promise<void>;
    ordersCancelSign(hash: string): Promise<OrderCancelParams>;
    getAssetOrderVersion(assetData: Asset): Promise<{
        orderVersion: OrderVersionData;
        newAsset: Asset;
    }>;
    createSellOrder({ asset, quantity, paymentToken, listingTime, expirationTime, startAmount, endAmount, buyerAddress }: SellOrderParams): Promise<any>;
    createAuctionOrder({ asset, quantity, paymentToken, expirationTime, startAmount, englishAuctionReservePrice }: EnglishAuctionOrderParams): Promise<any>;
    createBiddingOrder({ asset, quantity, paymentToken, startAmount, bestAsk }: BiddingOrderParams): Promise<any>;
    createBuyOrder({ asset, quantity, paymentToken, expirationTime, startAmount }: BuyOrderParams): Promise<any>;
    createLowerPriceOrder({ oldOrder, parameter, asset }: {
        oldOrder: Order;
        parameter: any;
        asset?: any;
    }): Promise<any>;
    acceptOrder(bestOrder: OrderJSON): Promise<import("../types").ETHSending>;
}
