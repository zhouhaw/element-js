import { BigNumber } from './constants';
import { Network } from '../index';
import { Schema } from '../schema/types';
import { ECSignature, UnhashedOrder } from '../types';
export declare function toBaseUnitAmount(amount: BigNumber, decimals: number): BigNumber;
export declare function makeBigNumber(arg: number | string | BigNumber): BigNumber;
export declare function web3Sign(web3: any, msg: string, account: string): Promise<string>;
export declare function elementSignInSign(walletProvider: any, nonce: number, account: string): Promise<{
    message: string;
    signature: string;
}>;
export declare function getAccountBalance(web3: any, account: string, erc20?: any): Promise<any>;
export declare function getTokenIDOwner(elementAssetContract: any, tokenId: any): Promise<string>;
export declare function getSchemaList(network: Network, schemaName?: string): Array<Schema<any>>;
export declare function hashOrder(web3: any, order: UnhashedOrder): string;
export declare function orderParamsEncode(order: UnhashedOrder): Array<any>;
export declare function orderSigEncode(order: ECSignature): Array<any>;
export declare function getTokenList(network: Network, { symbol, address }: {
    symbol?: string;
    address?: string;
}): Array<any>;
