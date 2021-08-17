import 'isomorphic-unfetch';
import { ElementAPIConfig, Order, OrderJSON, OrderType } from '../types';
import { GraphAPI } from './graphApi';
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
export declare class OrdersAPI extends GraphAPI {
    /**
     * Base url for the API
     */
    readonly apiBaseUrl: string;
    /**
     * Page size to use for fetching orders
     */
    pageSize: number;
    /**
     * Logger function to use when debugging
     */
    logger: (arg: string) => void;
    private apiKey;
    /**
     * Create an instance of the OpenSea API
     * @param config OpenSeaAPIConfig for setting up the API, including an optional API key, network name, and base URL
     * @param logger Optional function for logging debug strings before and after requests are made
     */
    constructor(config: ElementAPIConfig, logger?: (arg: string) => void);
    /**
     * Send an order to the orderbook.
     * Throws when the order is invalid.
     * IN NEXT VERSION: change order input to Order type
     * @param order Order JSON to post to the orderbook
     * @param retries Number of times to retry if the service is unavailable for any reason
     */
    ordersPost({ order, retries, LanguageType, Authorization }: {
        order: OrderJSON;
        retries?: number;
        LanguageType?: string;
        Authorization?: string;
    }): Promise<Order>;
    ordersVersion(orderAsset: OrderVersionParams, retries?: number): Promise<OrderVersionData>;
    ordersConfData(retries?: number): Promise<OrderConfData>;
    ordersCancel(cancelParams: OrderCancelParams, retries?: number): Promise<any>;
    ordersQuery(queryParams: OrderQueryParams, retries?: number): Promise<Array<OrderJSON>>;
    /**
     * POST JSON data to API, sending auth token in headers
     * @param apiPath Path to URL endpoint under API
     * @param body Data to send. Will be JSON.stringified
     * @param opts RequestInit opts, similar to Fetch API. If it contains
     *  a body, it won't be stringified.
     */
    post(apiPath: string, body?: object, opts?: RequestInit): Promise<any>;
    /**
     * Get from an API Endpoint, sending auth token in headers
     * @param apiPath Path to URL endpoint under API
     * @param opts RequestInit opts, similar to Fetch API
     */
    private _fetch;
    private _handleApiResponse;
}
