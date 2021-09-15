import { ElementAPIConfig } from '../../types';
import { GraphqlApi } from './base';
export declare class AssetsApi extends GraphqlApi {
    /**
     * Create an instance of the Element API
     * @param config ElementAPIConfig for setting up the API, including an optional API key, network name, and base URL
     * @param logger Optional function for logging debug strings before and after requests are made
     */
    constructor(config: ElementAPIConfig);
    exploreAssetsList(params?: {
        first: 20;
    }): Promise<any>;
    assetsDetail(params: {
        contractAddress: string;
        tokenId: string;
    }): Promise<any>;
    refreshMeta(params: {
        contractAddress: string;
        tokenId: string;
    }): Promise<any>;
}
