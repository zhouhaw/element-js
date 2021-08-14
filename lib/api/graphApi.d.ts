import { ElementAPIConfig } from '../types';
export declare class GraphAPI {
    /**
     * Base url for the API
     */
    readonly graphqlUrl: string;
    /**
     * Logger function to use when debugging
     */
    logger: (arg: string) => void;
    /**
     * Create an instance of the OpenSea API
     * @param config OpenSeaAPIConfig for setting up the API, including an optional API key, network name, and base URL
     * @param logger Optional function for logging debug strings before and after requests are made
     */
    constructor(config: ElementAPIConfig, logger?: (arg: string) => void);
    private getNewNonce;
    getSignInToken(walletProvider: any): Promise<void>;
}
