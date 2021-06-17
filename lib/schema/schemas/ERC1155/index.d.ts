import { Schema } from '../../types';
export interface SemiFungibleTradeType {
    id: string;
    address: string;
    quantity: string;
    data: string;
}
export declare const ERC1155Schema: Schema<SemiFungibleTradeType>;
