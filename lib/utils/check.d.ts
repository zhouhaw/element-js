import { Asset, Network, Order } from '../types';
export declare function checkSenderOfAuthenticatedProxy(exchangeContract: any, authenticatedProxyContract: any, proxyRegistryContract: any, account: string): Promise<boolean>;
export declare function getAccountBalance(web3: any, account: string, erc20?: any): Promise<any>;
export declare function getAccountNFTsBalance(nftsContract: any, account: string, tokenId: any): Promise<Number>;
export declare function getTokenIDOwner(elementAssetContract: any, tokenId: any): Promise<string>;
export declare function checkRegisterProxy(proxyRegistryContract: any, account: string): Promise<boolean>;
export declare function registerProxy(proxyRegistryContract: any, account: string): Promise<boolean>;
export declare function checkApproveTokenTransferProxy(exchangeContract: any, erc20Contract: any, account: string): Promise<boolean>;
export declare function approveTokenTransferProxy(exchangeContract: any, erc20Contract: any, account: string): Promise<boolean>;
export declare function checkApproveERC1155TransferProxy(proxyRegistryContract: any, nftsContract: any, account: string): Promise<boolean>;
export declare function approveERC1155TransferProxy(proxyRegistryContract: any, nftsContract: any, account: string): Promise<boolean>;
export declare function checkApproveERC721TransferProxy(proxyRegistryContract: any, nftsContract: any, account: string, tokenID: string): Promise<boolean>;
export declare function approveERC721TransferProxy(proxyRegistryContract: any, nftsContract: any, account: string, tokenID: string): Promise<boolean>;
export declare function checkSellUser(contract: any, asset: Asset, paymentTokenAddr: string, accountAddress: string): Promise<boolean>;
export declare function checkBuyUser(contract: any, paymentTokenAddr: any, accountAddress: string): Promise<boolean>;
export declare function checkMatchOrder(contract: any, buy: Order, sell: Order, accountAddress?: string): Promise<boolean>;
export declare function cancelledOrFinalized(exchangeHelper: any, orderHash: string): Promise<boolean>;
export declare function checkOrder(contract: any, order: Order, accountAddress?: string): Promise<boolean>;
export declare function checkDataToCall(netWorkName: Network, sell: Order): void;
export declare function validateOrder(exchangeHelper: any, order: any): Promise<any>;
export declare function validateAndFormatWalletAddress(web3: any, address: string): string;
export declare function _ordersCanMatch(buy: Order, sell: Order): boolean;
export declare function ordersCanMatch(exchangeHelper: any, buy: Order, sell: Order): Promise<any>;
