import { ExchangeSchema } from '../../../types';
export interface Exchange {
    address: string;
    sell?: Array<any>;
    sellSig?: Array<any>;
    buy?: Array<any>;
    buySig?: Array<any>;
    metadata?: string;
}
export declare const ElementExchangeSchemas: Required<Pick<ExchangeSchema<Exchange>, 'functions'>>;
