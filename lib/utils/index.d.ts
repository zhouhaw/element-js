import BigNumber from 'bignumber.js';
import { Network } from '../schema/types';
import { ECSignature, Order, OrderJSON, UnhashedOrder, UnsignedOrder } from '../types';
export { encodeBuy, encodeSell } from '../schema';
export { registerProxy, getAccountBalance, getAccountNFTsBalance, approveTokenTransferProxy, approveERC1155TransferProxy, checkSenderOfAuthenticatedProxy } from './check';
export { _makeBuyOrder, _makeSellOrder } from './order';
export declare const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
export declare const MAX_DIGITS_IN_UNSIGNED_256_INT = 78;
export declare const MAX_UINT_256: BigNumber;
export declare function orderParamsEncode(order: any): any[];
export declare function orderSigEncode(order: any): any[];
export declare function getOrderHash(web3: any, exchangeHelper: any, order: UnhashedOrder): Promise<any>;
export declare function validateOrder(exchangeHelper: any, order: UnhashedOrder): Promise<any>;
export declare function orderCanMatch(buy: Order, sell: Order): boolean;
export declare function hashOrder(web3: any, order: any): string;
export declare function validateAndFormatWalletAddress(web3: any, address: string): string;
export declare function signOrderHash(web3: any, hashedOrder: UnsignedOrder): Promise<ECSignature>;
export declare const orderToJSON: (order: Order) => OrderJSON;
export declare const orderFromJSON: (order: any) => Order;
export declare function estimateCurrentPrice(order: Order, secondsToBacktrack?: number, shouldRoundUp?: boolean): BigNumber;
export declare function getTokenList(network: Network): Array<any>;
export declare function transferFromERC1155(nftsContract: any, from: string, to: string, tokenId: any, amount?: number): Promise<boolean>;