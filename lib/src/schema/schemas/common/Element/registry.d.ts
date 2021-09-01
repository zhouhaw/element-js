import { ExchangeSchema } from '../../../types';
export interface Registry {
    address: string;
}
export declare const ElementRegistrySchemas: Required<Pick<ExchangeSchema<Registry>, 'address' | 'functions'>>;
