import BigNumber from 'bignumber.js'
BigNumber.config({ EXPONENTIAL_AT: 1e9 })

export { BigNumber }

export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'
export const NULL_BLOCK_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000'
export const MAX_DIGITS_IN_UNSIGNED_256_INT = 78 // 78 solt
export const MAX_UINT_256 = '115792089237316195423570985008687907853269984665640564039457584007913129639935' //new BigNumber(2).pow(256).minus(1).toString()

export const MIN_EXPIRATION_SECONDS = 10
export const MIN_Listing_SECONDS = 10
export const ORDER_MATCHING_LATENCY_SECONDS = 60 * 60 * 24 * 7

// FEE
export const ELEMENT_FEE_RECIPIENT = '0x0a56b3317ed60dc4e1027a63ffbe9df6fb102401'.toLowerCase()
export const DEFAULT_BUYER_FEE_BASIS_POINTS = 0
export const DEFAULT_SELLER_FEE_BASIS_POINTS = 250 //2.5%
export const DEFAULT_MAX_BOUNTY = DEFAULT_SELLER_FEE_BASIS_POINTS

//BOUNTY 版权费
export const ELEMENT_SELLER_BOUNTY_BASIS_POINTS = 100 //1%
export const INVERSE_BASIS_POINT = 10000 //100%

//VERSION
export const ORDERBOOK_VERSION: number = 1
export const API_VERSION: number = 1

//static call
// export const STATIC_CALL_TX_ORIGIN_ADDRESS = '0xFa19a235568616c6BE9140eA3AF7864d63D6D072'.toLowerCase()
// export const STATIC_CALL_TX_ORIGIN_RINKEBY_ADDRESS = '0xFa19a235568616c6BE9140eA3AF7864d63D6D072'.toLowerCase()
export const STATIC_EXTRADATA = '0x0c225aad' //succeedIfTxOriginMatchesHardcodedAddress

// export type ELEMENT_CONTRACTS = {
//   ElementixProxyRegistry: string
//   ElementixTokenTransferProxy: string
//   ElementixExchange: string
//   ExchangeHelper: string
//   ElementSharedAsset: string
//   ElementixExchangeKeeper: string
//   WETH: string
// }

// enum PRIVATE_CONTRACTS_ADDRESSES_old {
//   ElementixProxyRegistry = '0x48126f4a2894231Ba274429F98Fd62DfeD9056D9',
//   ElementixTokenTransferProxy = '0x02Bf5C4b79361D88Df2883b58A3926E99EeD104e',
//   ElementixExchange = '0x1A972898De9e2575b4abe88E1Bf2F59B3d4b0c5D',
//   ExchangeHelper = '0x8A5Bf74022fCe84947e92A05fAdD34730FeB4ca9',
//   ElementSharedAsset = '0x4cDdBf865Ee2A1a3711648Bb192E285f290f7985',
//   ElementixExchangeKeeper = '0xFa19a235568616c6BE9140eA3AF7864d63D6D072',
//   WETH = '0x37e5C2ADEcAfb0f5d9335d69c62dBae0aD610E3c'
// }

export enum RINKEBY_CONTRACTS_ADDRESSES {
  ElementixProxyRegistry = '0x03C4C60555DEc99E1830449524aDe323fF508a62',
  ElementixTokenTransferProxy = '0x48126f4a2894231Ba274429F98Fd62DfeD9056D9',
  ElementixExchange = '0x7ac5c8568122341f5D2c404eC8F9dE56456D60CA',
  ExchangeHelper = '0x11716B79a85B6FaA9BA469AA40050901a675E49c',
  ElementSharedAsset = '0x4cDdBf865Ee2A1a3711648Bb192E285f290f7985',
  ElementixExchangeKeeper = '0x8A5Bf74022fCe84947e92A05fAdD34730FeB4ca9',
  WETH = '0xc778417e063141139fce010982780140aa0cd5ab'
}
export enum PRIVATE_CONTRACTS_ADDRESSES {
  ElementixProxyRegistry = '0x023CA02bFB85A3901316EdFE6BBA92B8cb54C9E3',
  ElementixTokenTransferProxy = '0x20E1af184c5A40cFE63a377d8eE2A2029f1296FD',
  ElementixExchange = '0xb328610a54A438C80EE6103F8679d75D6c0E20Ab',
  ExchangeHelper = '0x5A5E397CfEAfc27e54648DD2cF63AF7c8af0fDf2',
  ElementSharedAsset = '0x09656BC39B5162012c595c0797740Dc1B0D62E9D',
  ElementSharedAssetV1 = '0x4cDdBf865Ee2A1a3711648Bb192E285f290f7985',
  ElementixExchangeKeeper = '0x2FB4580243D72fC1374262E9fe7a1003Dffd4c1d',
  WETH = '0x37e5C2ADEcAfb0f5d9335d69c62dBae0aD610E3c'
}

export const CONTRACTS_ADDRESSES = {
  rinkeby: RINKEBY_CONTRACTS_ADDRESSES,
  private: PRIVATE_CONTRACTS_ADDRESSES,
  main: PRIVATE_CONTRACTS_ADDRESSES
}
