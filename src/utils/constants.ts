import BigNumber from 'bignumber.js'
import { Network } from '..'

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

export const CHAIN_ID: { [key: string]: number } = {
  [Network.Main]: 1,
  [Network.Rinkeby]: 4,
  [Network.Polygon]: 137,
  [Network.Mumbai]: 80001
}

export const API_BASE_URL: {
  [key: string]: {
    api: string
    key: string
    secret: string
  }
} = {
  [Network.Main]: {
    api: 'https://element-api.eossql.com',
    key: 'zQbYj7RhC1VHIBdWU63ki5AJKXloamDT',
    secret: 'UqCMpfGn3VyQEdsjLkzJv9tNlgbKFD7O'
  },
  [Network.Rinkeby]: {
    api: 'https://element-api-test.eossql.com',
    key: 'ysBokbA3gKUzt61DmeHWjTFYZ07CGPQL',
    secret: 'a2PAJXRBChdpGvoyKEz3lLS5Yf1bM0NO'
  },
  [Network.Mumbai]: {
    api: 'https://element-api-test.eossql.com',
    key: 'ysBokbA3gKUzt61DmeHWjTFYZ07CGPQL',
    secret: 'a2PAJXRBChdpGvoyKEz3lLS5Yf1bM0NO'
  },
  [Network.Polygon]: {
    api: 'https://element-api.eossql.com',
    key: 'zQbYj7RhC1VHIBdWU63ki5AJKXloamDT',
    secret: 'UqCMpfGn3VyQEdsjLkzJv9tNlgbKFD7O'
  }
}

export enum POLYGON_CONTRACTS_ADDRESSES {
  ElementixProxyRegistry = '0x26aFE7885cdCFF35ADE8498Bd183577dC98E3fcc',
  ElementixTokenTransferProxy = '?',
  ElementixExchange = '0x2a3eCaeA2A31bb34e84835Bd6799614304AaFa5F',
  ExchangeHelper = '0xA3Fb1289f86025Aff90be8d39239836e24b986BF',
  ElementixExchangeKeeper = '',
  ElementSharedAsset = '0xa2e6f7dD012B3de9384079461Da3467E7b5E1aca',
  FeeRecipientAddress = '0x9F7A946d935c8Efc7A8329C0d894A69bA241345A',
  WETH = '0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa'
}

export enum MUMBAI_CONTRACTS_ADDRESSES {
  ElementixProxyRegistry = '0xd9E1b6171c1949cfE73974cdf4aCDa51950060Cb',
  ElementixTokenTransferProxy = '0x1c26cEB523F7664e775929d274d1c7DB2C884866',
  ElementixExchange = '0x88b6BdA30E7653E829668d8F022f7B2136838154',
  ExchangeHelper = '0x16940578632EfE0e7E4F557a0C6a255C5c9D2A27',
  ElementixExchangeKeeper = '',
  ElementSharedAsset = '0xDf131408BBfA3c48d3B60041aE1cBAfc017CdfE1',
  FeeRecipientAddress = '0x9F7A946d935c8Efc7A8329C0d894A69bA241345A',
  WETH = '0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa'
}

export enum MUMBAI_CONTRACTS_ADDRESSES_V1 {
  ElementixProxyRegistry = '0x26aFE7885cdCFF35ADE8498Bd183577dC98E3fcc',
  ElementixTokenTransferProxy = '0x4669f20D83f81Ee728c3b99E94F25E5DbEe682D5',
  ElementixExchange = '0x2a3eCaeA2A31bb34e84835Bd6799614304AaFa5F',
  ExchangeHelper = '0xA3Fb1289f86025Aff90be8d39239836e24b986BF',
  ElementixExchangeKeeper = '',
  ElementSharedAsset = '0xa2e6f7dD012B3de9384079461Da3467E7b5E1aca',
  FeeRecipientAddress = '0x9F7A946d935c8Efc7A8329C0d894A69bA241345A',
  WETH = '0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa'
}

export enum PRIVATE_CONTRACTS_ADDRESSES {
  ElementixProxyRegistry = '0x023CA02bFB85A3901316EdFE6BBA92B8cb54C9E3',
  ElementixTokenTransferProxy = '0x20E1af184c5A40cFE63a377d8eE2A2029f1296FD',
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
  ElementixTokenTransferProxy = '0x48126f4a2894231Ba274429F98Fd62DfeD9056D9',
  ElementixExchange = '0x7ac5c8568122341f5D2c404eC8F9dE56456D60CA',
  ExchangeHelper = '0x11716B79a85B6FaA9BA469AA40050901a675E49c',
  ElementixExchangeKeeper = '0x8A5Bf74022fCe84947e92A05fAdD34730FeB4ca9',
  ElementSharedAsset = '0x4cDdBf865Ee2A1a3711648Bb192E285f290f7985',
  FeeRecipientAddress = '0x23dc06f10dc382c7c9d4a1e992b95841e4f67792',
  WETH = '0xc778417e063141139fce010982780140aa0cd5ab'
}

export enum MAIN_CONTRACTS_ADDRESSES {
  ElementixProxyRegistry = '0x87f8388195728e9497aA11715A352472984607a2',
  ElementixTokenTransferProxy = '0x9B49Ee1B204F62Fc2AA1A88f267c2cf815c28755',
  ElementixExchange = '0x74d8e56924909731d0e65F954fc439Fa04634a61',
  ExchangeHelper = '0x467f748d7b7171533208a1D17c5b4c4a32eafb18',
  ElementixExchangeKeeper = '0xF35F8F0c3c2bE65Ef0aD554E1583743524b2a1d0',
  ElementSharedAsset = '0x4Fde78d3C8718f093f6Eb3699e3Ed8d091498dF9',
  FeeRecipientAddress = '0x7538262Ae993ca117A0e481f908209137A46268e',
  WETH = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
}

export const CONTRACTS_ADDRESSES: { [key: string]: any } = {
  [Network.Rinkeby]: RINKEBY_CONTRACTS_ADDRESSES,
  [Network.Private]: PRIVATE_CONTRACTS_ADDRESSES,
  [Network.Main]: MAIN_CONTRACTS_ADDRESSES,
  [Network.Mumbai]: MUMBAI_CONTRACTS_ADDRESSES,
  [Network.Polygon]: POLYGON_CONTRACTS_ADDRESSES
}
