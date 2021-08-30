import { AnnotatedFunctionABI, FunctionInputKind, Schema } from './types';
export declare const encodeReplacementPattern: ReplacementEncoder;
export declare const encodeCall: (abi: AnnotatedFunctionABI, parameters: any[]) => string;
export declare const encodeParamsCall: (abi: AnnotatedFunctionABI, { owner, replace, count }: {
    owner?: string | undefined;
    replace?: string | boolean | undefined;
    count?: string | undefined;
}) => string;
export interface CallSpec {
    target: string;
    dataToCall: string;
    replacementPattern: string;
}
export declare type SellEncoder<T> = (schema: Schema<T>, asset: T, address: string) => CallSpec;
export declare const encodeSell: SellEncoder<any>;
export declare type BuyEncoder<T> = (schema: Schema<T>, asset: T, address: string) => CallSpec;
export declare const encodeBuy: BuyEncoder<any>;
export declare type DefaultCallEncoder = (abi: AnnotatedFunctionABI, address: string) => string;
export declare const encodeDefaultCall: DefaultCallEncoder;
export declare type ReplacementEncoder = (abi: AnnotatedFunctionABI, kind?: FunctionInputKind) => string;
