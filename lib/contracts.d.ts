import { ElementAPIConfig, Network } from './types';
export declare class Contracts {
    web3: any;
    networkName: Network;
    tokenTransferProxyAddr: string;
    WETHAddr: string;
    elementSharedAssetAddr: string;
    elementixExchangeKeeperAddr: string;
    erc20: any;
    erc721: any;
    erc1155: any;
    authenticatedProxy: any;
    exchange: any;
    exchangeProxyRegistry: any;
    exchangeHelper: any;
    elementSharedAsset: any;
    WETH: any;
    constructor(web3: any, apiConfig?: ElementAPIConfig);
}
