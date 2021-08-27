import { Schema } from '../../../types';
export interface FungibleTradeType {
    address: string;
    account: string;
    quantity: string;
}
export declare const ERC20Schema: Schema<FungibleTradeType>;
