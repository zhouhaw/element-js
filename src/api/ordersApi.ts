import fetch from 'isomorphic-unfetch'
import { Network, ElementAPIConfig, Order, OrderJSON, OrderType } from '../types'
import { orderFromJSON, Sleep } from '../utils'
import { API_BASE_URL } from '../utils/constants'
import { GraphqlApi } from './graphqlApi'

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

export class OrdersAPI extends GraphqlApi {
  /**
   * Page size to use for fetching orders
   */
  public pageSize = 20
  /**
   * Logger function to use when debugging
   */
  public logger: (arg: string) => void

  constructor(config: ElementAPIConfig, logger?: (arg: string) => void) {
    super(config, logger)
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
      _throwOrContinue(error, retries)
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
      _throwOrContinue(error, retries)
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
      _throwOrContinue(error, retries)
      await Sleep(3000)
      return this.ordersConfData(retries - 1)
    }
    return json
  }

  public async ordersCancel(cancelParams: OrderCancelParams, retries = 2): Promise<any> {
    let json
    try {
      json = await this.post(`/v1/orders/cancel`, cancelParams)
    } catch (error) {
      _throwOrContinue(error, retries)
      await Sleep(3000)
      return this.ordersCancel(cancelParams, retries - 1)
    }
    return json
  }

  public async ordersQuery(queryParams: OrderQueryParams, retries = 2): Promise<Array<OrderJSON>> {
    let json
    try {
      json = await this.post(`/v1/orders/query`, queryParams)
    } catch (error) {
      _throwOrContinue(error, retries)
      await Sleep(3000)
      return this.ordersQuery(queryParams, retries - 1)
    }
    return json
  }

  /**
   * POST JSON data to API, sending auth token in headers
   * @param apiPath Path to URL endpoint under API
   * @param body Data to send. Will be JSON.stringified
   * @param opts RequestInit opts, similar to Fetch API. If it contains
   *  a body, it won't be stringified.
   */
  public async post(apiPath: string, body?: { [key: string]: any }, opts: RequestInit = {}): Promise<any> {
    const fetchOpts = {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      ...opts
    }

    const response = await this._fetch(apiPath, fetchOpts)
    if (response.ok) {
      const resJson: any = await response.json()
      if (resJson.data) {
        return resJson.data
      } else {
        return resJson
      }
    } else {
      return response
    }
  }

  /**
   * Get from an API Endpoint, sending auth token in headers
   * @param apiPath Path to URL endpoint under API
   * @param opts RequestInit opts, similar to Fetch API
   */
  private async _fetch(apiPath: string, opts: RequestInit = {}) {
    const apiBase = this.apiBaseUrl
    const token = this.authToken
    const finalUrl = apiBase + apiPath
    const finalOpts = {
      ...opts,
      headers: {
        ...(token ? { Authorization: token } : {}),
        ...(opts.headers || {})
      }
    }

    this.logger(`Sending request: ${finalUrl} ${JSON.stringify(finalOpts).substr(0, 100)}...`)

    return fetch(finalUrl, finalOpts).then(async (res) => this._handleApiResponse(res))
  }

  private async _handleApiResponse(response: Response) {
    if (response.ok) {
      this.logger(`Got success: ${response.status}`)
      return response
    }

    let result
    let errorMessage
    try {
      result = await response.text()
      result = JSON.parse(result)
    } catch {
      // Result will be undefined or text
    }

    this.logger(`Got error ${response.status}: ${JSON.stringify(result)}`)

    switch (response.status) {
      case 400:
        errorMessage = result && result.errors ? result.errors.join(', ') : `Invalid request: ${JSON.stringify(result)}`
        break
      case 401:
      case 403:
        errorMessage = `Unauthorized. Full message was '${JSON.stringify(result)}'`
        break
      case 404:
        errorMessage = `Not found. Full message was '${JSON.stringify(result)}'`
        break
      case 500:
        errorMessage = `Internal server error. OpenSea has been alerted, but if the problem persists please contact us via Discord: https://discord.gg/ga8EJbv - full message was ${JSON.stringify(
          result
        )}`
        break
      case 503:
        errorMessage = `Service unavailable. Please try again in a few minutes. If the problem persists please contact us via Discord: https://discord.gg/ga8EJbv - full message was ${JSON.stringify(
          result
        )}`
        break
      default:
        errorMessage = `Message: ${JSON.stringify(result)}`
        break
    }

    throw new Error(`API Error ${response.status}: ${errorMessage}`)
  }
}

function _throwOrContinue(error: Error, retries: number) {
  const isUnavailable = !!error.message && (error.message.includes('503') || error.message.includes('429'))
  if (retries <= 0 || !isUnavailable) {
    throw error
  }
}
