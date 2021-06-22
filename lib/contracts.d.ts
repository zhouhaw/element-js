import { ElementAPIConfig, Network, Token } from './types';
export declare class Contracts {
    web3: any;
    networkName: Network;
    contractsAddr: any;
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
    elementSharedAssetV1: any;
    WETH: any;
    paymentTokenList: Array<Token>;
    ETH: Token;
    constructor(web3: any, apiConfig?: ElementAPIConfig);
}
