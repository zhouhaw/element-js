import { Network, ElementAPIConfig, Order, OrderJSON, OrderType } from '../types'
import { orderFromJSON, Sleep } from '../utils'
import { API_BASE_URL, CHAIN, CHAIN_ID } from './config'
import { Fetch } from './base'

export interface OrderVersionParams {
  contractAddress: string
  tokenId: string | undefined
  chain: string
  chainId: string
}

export interface OrderVersionData {
  isTradable: boolean
  isEditable: boolean
  uri: string
  orderVersion: number
}

export interface OrderConfData {
  engReserveMinEth: number // 英式拍卖最低保留价（eth计价单位）
  offerMinEth: number // 买单下单的最低价（eth计价单位）
  relayerFee: number // 平台手续费（万分比，200的实际意义代表2%)
}

export interface OrderCancelParams {
  hash: string // 取消订单的Hash
  signature: string
}

export interface OrderQueryParams {
  assetContractAddress: string //
  tokenId: string
  orderType: OrderType
}

export class OrdersAPI extends Fetch {
  /**
   * Page size to use for fetching orders
   */
  public pageSize = 20
  /**
   * Logger function to use when debugging
   */
  public logger: (arg: string) => void

  public chain: string
  public chainId: number
  public walletChainId: string

  constructor(config: ElementAPIConfig, logger?: (arg: string) => void) {
    super(config.apiBaseUrl || API_BASE_URL[config.networkName].api, logger)
    const _network: Network = config.networkName
    this.authToken = config.authToken || ''
    this.chain = CHAIN[_network]
    this.chainId = CHAIN_ID[_network]
    this.walletChainId = `0x${this.chainId.toString(16)}`

    // Debugging: default to nothing
    this.logger = logger || ((arg: string) => arg)
  }

  /**
   * Send an order to the orderbook.
   * Throws when the order is invalid.
   * IN NEXT VERSION: change order input to Order type
   * @param order Order JSON to post to the orderbook
   * @param retries Number of times to retry if the service is unavailable for any reason
   */
  public async ordersPost({
    order,
    retries = 2
  }: {
    order: OrderJSON
    retries?: number
    LanguageType?: string
    Authorization?: string
  }): Promise<any> {
    let json
    try {
      //X-Viewer-Addr
      json = (await this.post(`/v1/orders/post`, order)) as OrderJSON
    } catch (error) {
      this.throwOrContinue(error, retries)
      await Sleep(3000)
      return this.ordersPost({ order, retries: retries - 1 })
    }
    return json
  }

  public async ordersVersion(orderAsset: OrderVersionParams, retries = 2): Promise<OrderVersionData> {
    let json: OrderVersionData
    try {
      json = (await this.post(`/v1/orders/orderVersionQuery`, orderAsset)) as OrderVersionData
    } catch (error) {
      this.throwOrContinue(error, retries)
      await Sleep(3000)
      return this.ordersVersion(orderAsset, retries - 1)
    }
    return json
  }

  public async ordersConfData(retries = 2): Promise<OrderConfData> {
    let json: OrderConfData
    try {
      json = (await this.post(`/v1/orders/confData`)) as OrderConfData
    } catch (error) {
      this.throwOrContinue(error, retries)
      await Sleep(3000)
      return this.ordersConfData(retries - 1)
    }
    return json
  }

  public async ordersHidden(cancelParams: OrderCancelParams, retries = 2): Promise<any> {
    let json
    try {
      json = await this.post(`/v1/orders/cancel`, cancelParams)
    } catch (error) {
      this.throwOrContinue(error, retries)
      await Sleep(3000)
      return this.ordersHidden(cancelParams, retries - 1)
    }
    return json
  }

  public async ordersQuery(queryParams: OrderQueryParams, retries = 2): Promise<Array<OrderJSON>> {
    let json
    try {
      json = await this.post(`/v1/orders/query`, queryParams)
    } catch (error) {
      this.throwOrContinue(error, retries)
      await Sleep(3000)
      return this.ordersQuery(queryParams, retries - 1)
    }
    return json
  }
}
