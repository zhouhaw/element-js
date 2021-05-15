import BigNumber from 'bignumber.js'
BigNumber.config({ EXPONENTIAL_AT: 1e9 })

export { BigNumber }
export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'
export const NULL_BLOCK_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000'
export const MAX_DIGITS_IN_UNSIGNED_256_INT = 78 // 78 solt
export const MAX_UINT_256 = new BigNumber(2).pow(256).minus(1) // approve

export const INVERSE_BASIS_POINT = 10000

export const MIN_EXPIRATION_SECONDS = 10
export const ORDER_MATCHING_LATENCY_SECONDS = 60 * 60 * 24 * 7
