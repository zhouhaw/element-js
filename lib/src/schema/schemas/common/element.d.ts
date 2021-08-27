import { Schema } from '../../types';
export interface Exchange {
    account?: string;
    accountProxy?: string;
    sell?: string;
    sellSig?: string;
    buy?: string;
    buySig?: string;
}
export declare const elementSchemas: Required<Pick<Schema<Exchange>, 'functions'>>;
