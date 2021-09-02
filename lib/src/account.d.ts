import { ElementError } from './base/error';
import { ContractSchemas } from './contracts/index';
import { Asset, ElementAPIConfig, ExchangeMetadata, Order, UnsignedOrder } from './types';
import { Web3 } from './api/ethApi';
export declare class Account extends ContractSchemas {
    elementAccount: string;
    accountProxy: '';
    constructor(web3: Web3, apiConfig?: ElementAPIConfig);
    getOrderApprove(order: UnsignedOrder): Promise<any>;
    getAccountProxy(): Promise<"">;
    registerProxy(): Promise<any>;
    checkTokenTransferProxy(to: string): Promise<string>;
    getTokenBalances(to: string, account?: string): Promise<string>;
    getAssetBalances(metadata: ExchangeMetadata, account?: string): Promise<string>;
    approveTokenTransferProxy(to: string): Promise<any>;
    checkAssetTransferProxy(metadata: ExchangeMetadata): Promise<boolean>;
    approveAssetTransferProxy(metadata: ExchangeMetadata): Promise<any>;
    orderMatch({ buy, sell, metadata }: {
        buy: Order;
        sell: Order;
        metadata?: string;
    }): Promise<any>;
    orderCancel({ order }: {
        order: Order;
    }): Promise<any>;
    assetTransfer(asset: Asset, to: string): Promise<any>;
    accountApprove(error: ElementError): Promise<void>;
}
