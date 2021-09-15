import { GraphQLClient } from 'graphql-request';
import { ElementAPIConfig, Network, Token } from '../../types';
export declare class GraphqlApi implements ElementAPIConfig {
    networkName: Network;
    authToken: string;
    account: string;
    /**
     * Base url for the API
     */
    readonly apiBaseUrl: string;
    gqlClient: GraphQLClient;
    /**
     * Logger function to use when debugging
     */
    private appKey;
    private appSecret;
    chain: string;
    private chainId;
    walletChainId: string;
    /**
     * Create an instance of the Element API
     * @param config ElementAPIConfig for setting up the API, including an optional API key, network name, and base URL
     * @param logger Optional function for logging debug strings before and after requests are made
     */
    constructor(config: ElementAPIConfig);
    paymentTokens?: Token[] | undefined;
    /**
     * 访问限制
     * 添加API签名
     * X-Api-Key appKey
     * X-Api-Sign	验证签名
     */
    private getAPISign;
    blockChainRequest({ funcName, gql, params }: {
        funcName: string;
        gql: string;
        params: any;
    }): Promise<any>;
    putRequest({ funcName, gql, params }: {
        funcName: string;
        gql: string;
        params: any;
    }): Promise<any>;
}
