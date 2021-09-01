/// <reference types="node" />
import { EventEmitter } from 'events';
import Web3 from 'web3';
import { ElementAPIConfig, Network, Token } from '../types';
import { AnnotatedFunctionOutput, LimitedCallSpec } from '../schema/types';
export declare class ContractSchemas extends EventEmitter {
    web3: Web3;
    networkName: Network;
    contractsAddr: any;
    WETHAddr: string;
    elementSharedAssetAddr: string;
    elementixExchangeKeeperAddr: string;
    feeRecipientAddress: string;
    elementixProxyRegistry: string;
    elementixExchange: string;
    elementixTokenTransferProxy: string;
    WETHToekn: Token;
    paymentTokenList: Array<Token>;
    ETH: Token;
    Erc20Func: import("../schema/types").SchemaFunctions<import("../schema/schemas/common/ERC20").FungibleTradeType>;
    ElementRegistryFunc: import("../schema/types").SchemaFunctions<import("../schema/schemas/common/Element/registry").Registry>;
    ElementExchangeFunc: {
        orderMatch?: ((asset: import("../schema/schemas/common/Element/exchange").Exchange) => import("../schema/types").AnnotatedFunctionABI) | undefined;
        orderCancel?: ((asset: import("../schema/schemas/common/Element/exchange").Exchange) => import("../schema/types").AnnotatedFunctionABI) | undefined;
        registerProxy?: ((asset: import("../schema/schemas/common/Element/exchange").Exchange) => import("../schema/types").AnnotatedFunctionABI) | undefined;
        accountProxy?: ((asset: import("../schema/schemas/common/Element/exchange").Exchange) => import("../schema/types").AnnotatedFunctionABI) | undefined;
    };
    constructor(web3: any, apiConfig?: ElementAPIConfig);
    ethCall(callData: LimitedCallSpec, outputs: AnnotatedFunctionOutput[]): Promise<any>;
    ethSend(callData: LimitedCallSpec, from: string): Promise<any>;
}
