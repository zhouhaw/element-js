import { ElementError } from './base/error';
import { Contracts } from './contracts';
import { Asset, ElementAPIConfig, ExchangeMetadata, UnsignedOrder } from './types';
import { EthApi, Web3 } from './api/ethApi';
import { AnnotatedFunctionOutput, LimitedCallSpec } from './schema/types';
export declare class Account extends Contracts {
    ethApi: EthApi;
    elementAccount: string;
    accountProxy: '';
    Erc20Func: import("./schema/types").SchemaFunctions<import("./schema/schemas/common/ERC20").FungibleTradeType>;
    ElementRegistryFunc: import("./schema/types").SchemaFunctions<import("./schema/schemas/common/Element/registry").Registry>;
    proxyRegistry: any;
    tokenTransferProxy: any;
    constructor(web3: Web3, apiConfig?: ElementAPIConfig);
    ethCall(callData: LimitedCallSpec, outputs: AnnotatedFunctionOutput[]): Promise<any>;
    ethSend(callData: LimitedCallSpec): Promise<any>;
    getOrderApprove(order: UnsignedOrder): Promise<any>;
    getAccountProxy(): Promise<"">;
    registerProxy(): Promise<any>;
    checkTokenTransferProxy(to: string): Promise<string>;
    getTokenBalances(to: string): Promise<string>;
    approveTokenTransferProxy(to: string): Promise<any>;
    checkAssetTransferProxy(metadata: ExchangeMetadata): Promise<boolean>;
    approveAssetTransferProxy(metadata: ExchangeMetadata): Promise<any>;
    assetTransfer(asset: Asset, to: string): Promise<any>;
    initApprove(error: ElementError): Promise<void>;
}
