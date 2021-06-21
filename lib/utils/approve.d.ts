export declare function registerProxy(proxyRegistryContract: any, account: string): Promise<boolean>;
export declare function approveTokenTransferProxy(exchangeContract: any, erc20Contract: any, account: string): Promise<boolean>;
export declare function approveERC1155TransferProxy(proxyRegistryContract: any, nftsContract: any, account: string): Promise<boolean>;
export declare function approveERC721TransferProxy(proxyRegistryContract: any, nftsContract: any, account: string, tokenID: string): Promise<boolean>;
