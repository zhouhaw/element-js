import BigNumber from 'bignumber.js';
export { BigNumber };
export declare const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
export declare const NULL_BLOCK_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000";
export declare const MAX_DIGITS_IN_UNSIGNED_256_INT = 78;
export declare const MAX_UINT_256 = "115792089237316195423570985008687907853269984665640564039457584007913129639935";
export declare const MIN_EXPIRATION_SECONDS = 10;
export declare const MIN_Listing_SECONDS = 10;
export declare const ORDER_MATCHING_LATENCY_SECONDS: number;
export declare const ELEMENT_FEE_RECIPIENT: string;
export declare const DEFAULT_BUYER_FEE_BASIS_POINTS = 0;
export declare const DEFAULT_SELLER_FEE_BASIS_POINTS = 250;
export declare const DEFAULT_MAX_BOUNTY = 250;
export declare const ELEMENT_SELLER_BOUNTY_BASIS_POINTS = 100;
export declare const INVERSE_BASIS_POINT = 10000;
export declare const ORDERBOOK_VERSION: number;
export declare const API_VERSION: number;
export declare const STATIC_EXTRADATA = "0x0c225aad";
declare enum PRIVATE_CONTRACTS_ADDRESSES {
    ElementixProxyRegistry = "0x023CA02bFB85A3901316EdFE6BBA92B8cb54C9E3",
    ElementixTokenTransferProxy = "0x20E1af184c5A40cFE63a377d8eE2A2029f1296FD",
    ElementixExchange = "0xb328610a54A438C80EE6103F8679d75D6c0E20Ab",
    ExchangeHelper = "0x5A5E397CfEAfc27e54648DD2cF63AF7c8af0fDf2",
    ElementSharedAsset = "0x09656BC39B5162012c595c0797740Dc1B0D62E9D",
    ElementixExchangeKeeper = "0x2FB4580243D72fC1374262E9fe7a1003Dffd4c1d",
    WETH = "0x37e5C2ADEcAfb0f5d9335d69c62dBae0aD610E3c"
}
export declare const CONTRACTS_ADDRESSES: {
    rinkeby: typeof PRIVATE_CONTRACTS_ADDRESSES;
    private: typeof PRIVATE_CONTRACTS_ADDRESSES;
    main: typeof PRIVATE_CONTRACTS_ADDRESSES;
};
