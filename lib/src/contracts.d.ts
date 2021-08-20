/// <reference types="node" />
import { ElementAPIConfig, Network, Token } from './types';
import { EventEmitter } from 'events';
export declare class Contracts extends EventEmitter {
    web3: any;
    networkName: Network;
    contractsAddr: any;
    WETHAddr: string;
    elementSharedAssetAddr: string;
    elementixExchangeKeeperAddr: string;
    feeRecipientAddress: string;
    erc20: any;
    erc721: any;
    erc1155: any;
    authenticatedProxy: any;
    exchange: any;
    exchangeProxyRegistry: any;
    exchangeHelper: any;
    elementSharedAsset: any;
    elementSharedAssetV1: any;
    WETHContract: any;
    WETHToekn: Token;
    paymentTokenList: Array<Token>;
    ETH: Token;
    constructor(web3: any, apiConfig?: ElementAPIConfig);
}
