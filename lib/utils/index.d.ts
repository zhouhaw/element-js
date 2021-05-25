import { BigNumber } from './constants';
import { Order } from '../types';
export declare const orderFromJSON: (order: any) => Order;
export declare function transferFromERC1155(nftsContract: any, from: string, to: string, tokenId: any, amount?: number): Promise<boolean>;
export declare function transferFromERC721(nftsContract: any, from: string, to: string, tokenId: any, amount?: number): Promise<boolean>;
export declare function transferFromWETH(WETHContract: any, account: string, amount: number): Promise<void>;
/**
 * @desc 链上返回大数处理，并小数点默认保留5位小数
 * @Params (bigNumberValue大数, decimalPow位, decimalDigits保留几个小数点)
 * @method chainValueConvert(bigNumberValue, decimalPow, decimalDigits)
 */
export declare function chainValueConvert(bigNumberValue: BigNumber.Value, decimalPow: number, decimalDigits?: number): string;
export declare function chainValueConvert(bigNumberValue: () => BigNumber.Value, decimalPow: number, decimalDigits?: number): string;
/**
 * @desc 返回真实链上所需要的数值
 * @Params (decimalDigitsValue大数, decimalPow位)
 * @method chainValueRestore(decimalDigitsValue, decimalPow)
 */
export declare function chainValueRestore(decimalDigitsValue: BigNumber.Value, decimalPow: number): string;
export declare function chainValueRestore(decimalDigitsValue: () => BigNumber.Value, decimalPow: number): string;
