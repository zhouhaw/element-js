export { ElementSchemaName, FeeMethod, HowToCall, Network, OrderSide, SaleKind } from './src/types'
export type { Asset, Order, OrderJSON, Token, UnsignedOrder } from './src/types'
export { schemas, encodeBuy, encodeSell, encodeCall, encodeParamsCall } from './src/schema'
export {
  getElementAssetURI,
  ordersCanMatch,
  validateOrder,
  checkOrder,
  checkMatchOrder,
  checkRegisterProxy,
  getOrderCancelledOrFinalized,
  checkApproveTokenTransferProxy,
  checkApproveERC1155TransferProxy,
  checkSenderOfAuthenticatedProxy
} from './src/utils/check'

export {
  registerProxy,
  approveSchemaProxy,
  approveTokenTransferProxy,
  approveERC1155TransferProxy,
  approveERC721TransferProxy
} from './src/utils/approve'

export { orderToJSON, getPriceParameters, getCurrentPrice, computeOrderCallData } from './src/utils/makeOrder'
export { BigNumber, NULL_ADDRESS, NULL_BLOCK_HASH, DEFAULT_SELLER_FEE_BASIS_POINTS } from './src/utils/constants'

export {
  PRIVATE_CONTRACTS_ADDRESSES,
  MAIN_CONTRACTS_ADDRESSES,
  RINKEBY_CONTRACTS_ADDRESSES,
  CONTRACTS_ADDRESSES
} from './src/contracts/config'

export { orderFromJSON, Sleep } from './src/utils'
export { web3Sign } from './src/utils/helper'
export {
  transferFromERC1155,
  transferFromERC721,
  transferFromERC20,
  transferFromWETH,
  transferFromSchema
} from './src/utils/transfer'
export {
  elementSignInSign,
  getTokenList,
  toBaseUnitAmount,
  getTokenIDOwner,
  getAccountBalance,
  getSchemaList,
  makeBigNumber
} from './src/utils/helper'

export { Orders, OrderCheckStatus } from './src/orders'
export { OrdersAPI } from './src/api/restful/ordersApi'
export type { OrderQueryParams } from './src/api/restful/ordersApi'
export { ElementOrders } from './src/api'
export type { SellOrderParams } from './src/api'
export type { CallBack } from './src/orders'
export { Contracts } from './src/contracts'
export { ErrorCodes, ElementError } from './src/base/error'
