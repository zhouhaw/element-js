import { Schema } from '../../../types';
export interface Exchange {
    account?: string;
    accountProxy?: string;
    sell?: string;
    sellSig?: string;
    buy?: string;
    buySig?: string;
}
export declare const ElementSchemas: Required<Pick<Schema<Exchange>, 'functions'>>;
