import { BigNumber } from './constants';
import { Order } from '../types';
export declare const orderFromJSON: (order: any) => Order;
export declare function transferFromERC1155(nftsContract: any, from: string, to: string, tokenId: any, amount?: number): Promise<boolean>;
export declare function transferFromERC721(nftsContract: any, from: string, to: string, tokenId: any, amount?: number): Promise<boolean>;
export declare function transferFromWETH(WETHContract: any, account: string, amount: number): Promise<void>;
export declare function estimateCurrentPrice(order: Order, secondsToBacktrack?: number, shouldRoundUp?: boolean): BigNumber;
