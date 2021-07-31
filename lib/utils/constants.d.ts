import BigNumber from 'bignumber.js';
export { BigNumber };
export declare const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
export declare const NULL_BLOCK_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000";
export declare const MAX_DIGITS_IN_UNSIGNED_256_INT = 78;
export declare const MAX_UINT_256 = "115792089237316195423570985008687907853269984665640564039457584007913129639935";
export declare const MIN_EXPIRATION_SECONDS = 10;
export declare const MIN_Listing_SECONDS = 10;
export declare const ORDER_MATCHING_LATENCY_SECONDS: number;
export declare const DEFAULT_BUYER_FEE_BASIS_POINTS = 0;
export declare const DEFAULT_SELLER_FEE_BASIS_POINTS = 200;
export declare const DEFAULT_MAX_BOUNTY = 200;
export declare const ELEMENT_SELLER_BOUNTY_BASIS_POINTS = 100;
export declare const INVERSE_BASIS_POINT = 10000;
export declare const STATIC_EXTRADATA = "0x0c225aad";
export declare const CHECK_ETH_BALANCE = false;
export declare const CryptoKetties: {
    address: string;
    approve: string;
}[];
export declare const CryptoKettiesRinkeby: {
    address: string;
    approve: string;
}[];
export declare enum PRIVATE_CONTRACTS_ADDRESSES {
    ElementixProxyRegistry = "0x023CA02bFB85A3901316EdFE6BBA92B8cb54C9E3",
    ElementixExchange = "0xb328610a54A438C80EE6103F8679d75D6c0E20Ab",
    ExchangeHelper = "0x5A5E397CfEAfc27e54648DD2cF63AF7c8af0fDf2",
    ElementixExchangeKeeper = "0x2FB4580243D72fC1374262E9fe7a1003Dffd4c1d",
    ElementSharedAsset = "0x09656BC39B5162012c595c0797740Dc1B0D62E9D",
    ElementSharedAssetV1 = "0x4cDdBf865Ee2A1a3711648Bb192E285f290f7985",
    FeeRecipientAddress = "0x23dc06f10dc382c7c9d4a1e992b95841e4f67792",
    WETH = "0x37e5C2ADEcAfb0f5d9335d69c62dBae0aD610E3c"
}
export declare enum RINKEBY_CONTRACTS_ADDRESSES {
    ElementixProxyRegistry = "0x03C4C60555DEc99E1830449524aDe323fF508a62",
    ElementixExchange = "0x7ac5c8568122341f5D2c404eC8F9dE56456D60CA",
    ExchangeHelper = "0x11716B79a85B6FaA9BA469AA40050901a675E49c",
    ElementixExchangeKeeper = "0x8A5Bf74022fCe84947e92A05fAdD34730FeB4ca9",
    ElementSharedAsset = "0x4cDdBf865Ee2A1a3711648Bb192E285f290f7985",
    FeeRecipientAddress = "0x23dc06f10dc382c7c9d4a1e992b95841e4f67792",
    WETH = "0xc778417e063141139fce010982780140aa0cd5ab"
}
export declare enum MAIN_CONTRACTS_ADDRESSES {
    ElementixProxyRegistry = "0x87f8388195728e9497aA11715A352472984607a2",
    ElementixExchange = "0x74d8e56924909731d0e65F954fc439Fa04634a61",
    ExchangeHelper = "0x467f748d7b7171533208a1D17c5b4c4a32eafb18",
    ElementixExchangeKeeper = "0xF35F8F0c3c2bE65Ef0aD554E1583743524b2a1d0",
    ElementSharedAsset = "0x4Fde78d3C8718f093f6Eb3699e3Ed8d091498dF9",
    FeeRecipientAddress = "0x7538262Ae993ca117A0e481f908209137A46268e",
    WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
}
export declare const CONTRACTS_ADDRESSES: {
    rinkeby: typeof RINKEBY_CONTRACTS_ADDRESSES;
    private: typeof PRIVATE_CONTRACTS_ADDRESSES;
    main: typeof MAIN_CONTRACTS_ADDRESSES;
};
