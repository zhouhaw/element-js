import { GraphqlApi } from './base';
export declare class UsersApi extends GraphqlApi {
    getNewNonce(): Promise<number>;
    getSignInToken({ message, signature }: {
        message: string;
        signature: string;
    }): Promise<string>;
    getUserAssetsList(): Promise<any>;
    getAccountOrders(): Promise<any>;
}
