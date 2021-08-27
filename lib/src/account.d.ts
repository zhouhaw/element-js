import { ElementError } from './base/error';
import { Contracts } from './contracts';
import { ElementAPIConfig } from './types';
import { EthApi, Web3 } from './api/ethApi';
export declare class Account extends Contracts {
    ethApi: EthApi;
    elementAccount: string;
    constructor(web3: Web3, apiConfig?: ElementAPIConfig);
    getProxy(): Promise<any>;
    registerProxy(): Promise<any>;
    checkTokenTransferProxy(tokenAddr: string): Promise<any>;
    getTokenBalances(tokenAddr: string): Promise<string>;
    approveTokenTransferProxy(tokenAddr: string): Promise<any>;
    initApprove(error: ElementError): Promise<void>;
}
