import { Schema } from '../../../types';
export interface Exchange {
    address: string;
    sell?: string;
    sellSig?: string;
    buy?: string;
    buySig?: string;
}
export declare const ElementExchangeSchemas: Required<Pick<Schema<Exchange>, 'functions'>>;
