import { Asset, Network, CallBack } from '../../index';
import { OrderVersionData, OrdersAPI, OrderCancelParams } from './restful/ordersApi';
import { Account } from '../account';
import { UsersApi } from './graphql';
import Web3 from 'web3';
import { BuyOrderParams, SellOrderParams } from './types';
export type { SellOrderParams };
export declare class ElementOrders extends OrdersAPI {
    orders: any;
    account: Account;
    gqlApi: UsersApi;
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
    login(): Promise<void>;
    ordersCancelSign(hash: string): Promise<OrderCancelParams>;
    getAssetOrderVersion(assetData: Asset): Promise<{
        orderVersion: OrderVersionData;
        newAsset: Asset;
    }>;
    createSellOrder({ asset, quantity, paymentToken, listingTime, expirationTime, startAmount, endAmount, buyerAddress }: SellOrderParams): Promise<any>;
    createBuyOrder({ asset, quantity, paymentToken, expirationTime, startAmount }: BuyOrderParams): Promise<any>;
    acceptOrder(bestAskOrder: any, callBack?: CallBack): Promise<any>;
}
