import { ElementAPIConfig, OrderJSON, OrderType } from '../../types';
import { Fetch } from './base';
export interface OrderVersionParams {
    contractAddress: string;
    tokenId: string | undefined;
    chain: string;
    chainId: string;
}
export interface OrderVersionData {
    isTradable: boolean;
    isEditable: boolean;
    uri: string;
    orderVersion: number;
}
export interface OrderConfData {
    engReserveMinEth: number;
    offerMinEth: number;
    relayerFee: number;
}
export interface OrderCancelParams {
    hash: string;
    signature: string;
}
export interface OrderQueryParams {
    assetContractAddress: string;
    tokenId: string;
    orderType: OrderType;
}
export declare class OrdersAPI extends Fetch {
    /**
     * Page size to use for fetching orders
     */
    pageSize: number;
    /**
     * Logger function to use when debugging
     */
    logger: (arg: string) => void;
    chain: string;
    chainId: number;
    walletChainId: string;
    constructor(config: ElementAPIConfig, logger?: (arg: string) => void);
    /**
     * Send an order to the orderbook.
     * Throws when the order is invalid.
     * IN NEXT VERSION: change order input to Order type
     * @param order Order JSON to post to the orderbook
     * @param retries Number of times to retry if the service is unavailable for any reason
     */
    ordersPost({ order, retries }: {
        order: OrderJSON;
        retries?: number;
        LanguageType?: string;
        Authorization?: string;
    }): Promise<any>;
    ordersVersion(orderAsset: OrderVersionParams, retries?: number): Promise<OrderVersionData>;
    ordersConfData(retries?: number): Promise<OrderConfData>;
    ordersHidden(cancelParams: OrderCancelParams, retries?: number): Promise<any>;
    ordersQuery(queryParams: OrderQueryParams, retries?: number): Promise<Array<OrderJSON>>;
}
