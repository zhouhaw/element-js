import Web3 from 'web3';
import { Fetch } from './base';
export { Web3 };
export declare class EthApi extends Fetch {
    rpcUrl: string;
    web3SDK: Web3;
    constructor(providerUrl: string);
    getTransactionCount(account: string): Promise<number>;
    estimateGas(to: string, data: string): Promise<number>;
    getGasPrice(type?: string): Promise<number>;
    getSendTx({ from, to, data, value }: {
        from: string;
        to: string;
        data: string;
        value?: number;
    }): Promise<{
        from: string;
        to: string;
        value: number;
        gas: number;
        gasPrice: number;
        nonce: number;
        data: string;
    }>;
    sendTransaction({ from, to, data, value }: {
        from: string;
        to: string;
        data: string;
        value?: number;
    }): Promise<void>;
    contractCall(to: string, data: string): Promise<Response>;
}
