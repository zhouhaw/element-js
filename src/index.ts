export { ElementSchemaName, FeeMethod, HowToCall, Network, OrderSide, SaleKind } from './types'
export type { Asset, Order, OrderJSON, Token, UnsignedOrder } from './types'
export { schemas, encodeBuy, encodeSell, encodeCall, encodeParamsCall } from './schema'
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
} from './utils/check'

export {
  registerProxy,
  approveSchemaProxy,
  approveTokenTransferProxy,
  approveERC1155TransferProxy,
  approveERC721TransferProxy
} from './utils/approve'

export { orderToJSON, getPriceParameters, getCurrentPrice, computeOrderCallData } from './utils/makeOrder'
export { BigNumber, NULL_ADDRESS, NULL_BLOCK_HASH, DEFAULT_SELLER_FEE_BASIS_POINTS } from './utils/constants'

export {
  PRIVATE_CONTRACTS_ADDRESSES,
  MAIN_CONTRACTS_ADDRESSES,
  RINKEBY_CONTRACTS_ADDRESSES,
  CONTRACTS_ADDRESSES
} from './contracts/config'

export { orderFromJSON, Sleep } from './utils'
export { web3Sign } from './utils/helper'
export {
  transferFromERC1155,
  transferFromERC721,
  transferFromERC20,
  transferFromWETH,
  transferFromSchema
} from './utils/transfer'
export {
  elementSignInSign,
  getTokenList,
  toBaseUnitAmount,
  getTokenIDOwner,
  getAccountBalance,
  getSchemaList,
  makeBigNumber
} from './utils/helper'

export { Orders, OrderCheckStatus } from './orders'
export { OrdersAPI } from './api/restful/ordersApi'
export type { OrderQueryParams } from './api/restful/ordersApi'
export { ElementOrders } from './api/index'
export type { SellOrderParams } from './api/index'
export type { CallBack } from './orders'
export { Contracts } from './contracts'
export { ErrorCodes, ElementError } from './base/error'
