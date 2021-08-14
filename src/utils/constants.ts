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
export const DEFAULT_BUYER_FEE_BASIS_POINTS = 0
export const DEFAULT_SELLER_FEE_BASIS_POINTS = 200 //2%
export const DEFAULT_MAX_BOUNTY = DEFAULT_SELLER_FEE_BASIS_POINTS

//BOUNTY 版权费
export const ELEMENT_SELLER_BOUNTY_BASIS_POINTS = 100 //1%
export const INVERSE_BASIS_POINT = 10000 //100%

//static call
export const STATIC_EXTRADATA = '0x0c225aad' //succeedIfTxOriginMatchesHardcodedAddress

//
export const CHECK_ETH_BALANCE = false

export const ORDERBOOK_PATH = {
  main: 'http://order.element.market:8001/v1',
  rinkeby: 'https://element-api-test.eossql.com/v1'
}

export enum PRIVATE_CONTRACTS_ADDRESSES {
  ElementixProxyRegistry = '0x023CA02bFB85A3901316EdFE6BBA92B8cb54C9E3',
  // ElementixTokenTransferProxy = '0x20E1af184c5A40cFE63a377d8eE2A2029f1296FD',
  ElementixExchange = '0xb328610a54A438C80EE6103F8679d75D6c0E20Ab',
  ExchangeHelper = '0x5A5E397CfEAfc27e54648DD2cF63AF7c8af0fDf2',
  ElementixExchangeKeeper = '0x2FB4580243D72fC1374262E9fe7a1003Dffd4c1d',
  ElementSharedAsset = '0x09656BC39B5162012c595c0797740Dc1B0D62E9D',
  ElementSharedAssetV1 = '0x4cDdBf865Ee2A1a3711648Bb192E285f290f7985',
  FeeRecipientAddress = '0x23dc06f10dc382c7c9d4a1e992b95841e4f67792',
  WETH = '0x37e5C2ADEcAfb0f5d9335d69c62dBae0aD610E3c'
}

export enum RINKEBY_CONTRACTS_ADDRESSES {
  ElementixProxyRegistry = '0x03C4C60555DEc99E1830449524aDe323fF508a62',
  // ElementixTokenTransferProxy = '0x48126f4a2894231Ba274429F98Fd62DfeD9056D9',
  ElementixExchange = '0x7ac5c8568122341f5D2c404eC8F9dE56456D60CA',
  ExchangeHelper = '0x11716B79a85B6FaA9BA469AA40050901a675E49c',
  ElementixExchangeKeeper = '0x8A5Bf74022fCe84947e92A05fAdD34730FeB4ca9',
  ElementSharedAsset = '0x4cDdBf865Ee2A1a3711648Bb192E285f290f7985',
  FeeRecipientAddress = '0x23dc06f10dc382c7c9d4a1e992b95841e4f67792',
  WETH = '0xc778417e063141139fce010982780140aa0cd5ab'
}

export enum MAIN_CONTRACTS_ADDRESSES {
  ElementixProxyRegistry = '0x87f8388195728e9497aA11715A352472984607a2',
  // ElementixTokenTransferProxy = '0x9B49Ee1B204F62Fc2AA1A88f267c2cf815c28755',
  ElementixExchange = '0x74d8e56924909731d0e65F954fc439Fa04634a61',
  ExchangeHelper = '0x467f748d7b7171533208a1D17c5b4c4a32eafb18',
  ElementixExchangeKeeper = '0xF35F8F0c3c2bE65Ef0aD554E1583743524b2a1d0',
  ElementSharedAsset = '0x4Fde78d3C8718f093f6Eb3699e3Ed8d091498dF9',
  FeeRecipientAddress = '0x7538262Ae993ca117A0e481f908209137A46268e',
  WETH = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
}

export const CONTRACTS_ADDRESSES = {
  rinkeby: RINKEBY_CONTRACTS_ADDRESSES,
  private: PRIVATE_CONTRACTS_ADDRESSES,
  main: MAIN_CONTRACTS_ADDRESSES
}
