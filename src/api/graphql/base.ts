import { GraphQLClient } from 'graphql-request'
import { ElementAPIConfig, Network, Token } from '../../types'
import hmacSHA256 from 'crypto-js/hmac-sha256'
import { API_BASE_URL, CHAIN, CHAIN_ID } from '../config'

export class GraphqlApi implements ElementAPIConfig {
  public networkName: Network
  public authToken: string
  public account: string

  /**
   * Base url for the API
   */
  public readonly apiBaseUrl: string

  public gqlClient: GraphQLClient
  /**
   * Logger function to use when debugging
   */
  private appKey: string
  private appSecret: string
  public chain: string
  private chainId: number
  public walletChainId: string

  /**
   * Create an instance of the Element API
   * @param config ElementAPIConfig for setting up the API, including an optional API key, network name, and base URL
   * @param logger Optional function for logging debug strings before and after requests are made
   */
  constructor(config: ElementAPIConfig) {
    const _network: Network = config.networkName
    this.apiBaseUrl = config.apiBaseUrl || API_BASE_URL[_network].api
    this.chainId = CHAIN_ID[_network]
    this.appKey = API_BASE_URL[_network].key
    this.appSecret = API_BASE_URL[_network].secret
    this.account = config.account || ''

    if (!this.apiBaseUrl) {
      throw new Error(`${_network} undefined api`)
    }
    this.chain = CHAIN[_network]
    this.walletChainId = `0x${this.chainId.toString(16)}`

    this.networkName = _network
    this.authToken = ''
    const getSign = this.getAPISign()

    this.gqlClient = new GraphQLClient(`${this.apiBaseUrl}/graphql`, { headers: { ...getSign } })
    this.gqlClient = this.gqlClient.setHeader('X-Viewer-Addr', this.account)
  }

  paymentTokens?: Token[] | undefined

  /**
   * 访问限制
   * 添加API签名
   * X-Api-Key appKey
   * X-Api-Sign	验证签名
   */
  private getAPISign(): { 'X-Api-Key': string; 'X-Api-Sign': string } {
    // 随机数字字母，建议4位
    const nonce = Number.parseInt((Math.random() * (9999 - 1000 + 1) + 1000).toString(), 10)
    // 当前时间戳（秒）
    const timestamp = Number.parseInt((Date.now() / 1000).toString(), 10)
    // 使用appSecret进行HMacSha256加密函数
    const hmac256 = hmacSHA256(`${this.appKey}${nonce}${timestamp}`, this.appSecret)

    const headers = {
      'X-Api-Key': this.appKey,
      'X-Api-Sign': `${hmac256}.${nonce}.${timestamp}`
    }

    return headers
  }

  public identityRequest({ funcName, gql, params }: { funcName: string; gql: string; params: any }) {
    const variables = {
      ...params,
      identity: {
        blockChain: {
          chain: this.chain,
          chainId: this.walletChainId
        }
      }
    }
    this.gqlClient = this.gqlClient.setHeader('X-Query-Args', funcName)
    return this.gqlClient.request(gql, variables)
  }

  public blockChainRequest({ funcName, gql, params }: { funcName: string; gql: string; params: any }) {
    const variables = {
      ...params,
      blockChain: {
        chain: this.chain,
        chainId: this.walletChainId
      }
    }
    this.gqlClient = this.gqlClient.setHeader('X-Query-Args', funcName)
    return this.gqlClient.request(gql, variables)
  }
}
