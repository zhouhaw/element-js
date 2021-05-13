import BigNumber from 'bignumber.js';
import { ECSignature, Order, OrderJSON, UnhashedOrder, UnsignedOrder } from '../types';
import { schemas, encodeBuy, encodeSell } from '../schema';
export { schemas, encodeBuy, encodeSell };
export { checkSellUser, checkBuyUser, checkMatchOrder, checkRegisterProxy, registerProxy, getTokenIDOwner, getAccountBalance, getAccountNFTsBalance, checkApproveTokenTransferProxy, approveTokenTransferProxy, checkApproveERC1155TransferProxy, approveERC1155TransferProxy, approveERC721TransferProxy, checkSenderOfAuthenticatedProxy } from './check';
export { _makeBuyOrder, _makeSellOrder, getTokenList, getSchemaList } from './order';
export declare const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
export declare const NULL_BLOCK_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000";
export declare const MAX_DIGITS_IN_UNSIGNED_256_INT = 78;
export declare const MAX_UINT_256: BigNumber;
export declare function orderParamsEncode(order: any): any[];
export declare function orderSigEncode(order: any): any[];
export declare function getOrderHash(web3: any, exchangeHelper: any, order: UnhashedOrder): Promise<any>;
export declare function validateOrder(exchangeHelper: any, order: any): Promise<any>;
export declare function hashOrder(web3: any, order: UnhashedOrder): string;
export declare function hashAndValidateOrder(web3: any, exchangeHelper: any, order: UnhashedOrder): Promise<any>;
export declare function _ordersCanMatch(buy: Order, sell: Order): boolean;
export declare function ordersCanMatch(exchangeHelper: any, buy: Order, sell: Order): Promise<any>;
export declare function validateAndFormatWalletAddress(web3: any, address: string): string;
export declare function signOrderHash(web3: any, hashedOrder: UnsignedOrder): Promise<ECSignature>;
export declare const orderToJSON: (order: Order) => OrderJSON;
export declare const orderFromJSON: (order: any) => Order;
export declare function estimateCurrentPrice(order: Order, secondsToBacktrack?: number, shouldRoundUp?: boolean): BigNumber;
export declare function transferFromERC1155(nftsContract: any, from: string, to: string, tokenId: any, amount?: number): Promise<boolean>;
export declare function transferFromERC721(nftsContract: any, from: string, to: string, tokenId: any, amount?: number): Promise<boolean>;
export declare function toBaseUnitAmount(amount: BigNumber, decimals: number): BigNumber;
export declare function makeBigNumber(arg: number | string | BigNumber): BigNumber;
export declare function transferFromWETH(WETHContract: any, account: string, amount: number): Promise<void>;
