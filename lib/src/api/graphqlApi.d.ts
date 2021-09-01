import { GraphQLClient } from 'graphql-request';
import { Network } from '../index';
import { ElementAPIConfig } from '../types';
export declare class GraphqlApi implements ElementAPIConfig {
    networkName: Network;
    networkID: number;
    authToken: string;
    chain: string;
    chainId: number;
    walletChainId: string;
    /**
     * Base url for the API
     */
    readonly apiBaseUrl: string;
    gqlClient: GraphQLClient;
    /**
     * Logger function to use when debugging
     */
    logger: (arg: string) => void;
    private appKey;
    private appSecret;
    /**
     * Create an instance of the Element API
     * @param config ElementAPIConfig for setting up the API, including an optional API key, network name, and base URL
     * @param logger Optional function for logging debug strings before and after requests are made
     */
    constructor(config: ElementAPIConfig, logger?: (arg: string) => void);
    /**
     * 访问限制
     * 添加API签名
     * X-Api-Key appKey
     * X-Api-Sign	验证签名
     */
    private getAPISign;
    private getNewNonce;
    getSignInToken(walletProvider: any): Promise<string>;
}
