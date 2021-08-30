import { Schema } from '../../../types';
export interface Registry {
    address: string;
}
export declare const ElementRegistrySchemas: Required<Pick<Schema<Registry>, 'address' | 'functions'>>;
