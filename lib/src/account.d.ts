import { ElementError } from './base/error';
import { ContractSchemas } from './contracts/index';
import { Asset, ETHSending, PromiEvent, TransactionReceipt, BuyOrderApprove, ElementAPIConfig, ExchangeMetadata, Order, OrderJSON, SellOrderApprove, UnsignedOrder } from './types';
import { Web3 } from './api/ethApi';
export declare class Account extends ContractSchemas {
    elementAccount: string;
    accountProxy: string;
    constructor(web3: Web3, apiConfig?: ElementAPIConfig);
    getOrderApprove(order: UnsignedOrder | OrderJSON): Promise<SellOrderApprove | BuyOrderApprove>;
    getAccountProxy(): Promise<string>;
    registerProxy(): Promise<ETHSending>;
    checkTokenTransferProxy(to: string): Promise<string>;
    getTokenBalances(to: string, account?: string): Promise<string>;
    getAssetBalances(metadata: ExchangeMetadata, account?: string): Promise<string>;
    approveTokenTransferProxy(to: string): Promise<ETHSending>;
    checkAssetTransferProxy(metadata: ExchangeMetadata): Promise<boolean>;
    approveAssetTransferProxy(metadata: ExchangeMetadata): Promise<{
        sendTx: PromiEvent<TransactionReceipt>;
        txHash: string;
    }>;
    orderMatch({ buy, sell, metadata }: {
        buy: Order;
        sell: Order;
        metadata?: string;
    }): Promise<ETHSending>;
    orderCancel({ order }: {
        order: Order;
    }): Promise<ETHSending>;
    assetTransfer(asset: Asset, to: string): Promise<ETHSending>;
    accountApprove(error: ElementError): Promise<void>;
}
