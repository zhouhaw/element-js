import { Network } from './schema/types';
import { ElementAPIConfig } from './types';
export declare class Contracts {
    web3: any;
    networkName: Network;
    erc20: any;
    exchange: any;
    exchangeProxyRegistry: any;
    exchangeHelper: any;
    elementSharedAsset: any;
    tokenTransferProxyAddr: string;
    WETHAddr: string;
    constructor(web3: any, apiConfig?: ElementAPIConfig);
}
