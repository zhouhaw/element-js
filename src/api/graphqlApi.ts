import { gql, GraphQLClient } from 'graphql-request'
import { ElementAPIConfig, Network, Token } from '../types'
import hmacSHA256 from 'crypto-js/hmac-sha256'
import { API_BASE_URL, CHAIN, CHAIN_ID } from './config'

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
  private chain: string
  private chainId: number
  private walletChainId: string

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
    // this.gqlClient = this.gqlClient.setHeader('X-Viewer-Addr', this.account)
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

  public async getNewNonce(): Promise<number> {
    // const accountAddress = walletProvider.eth.defaultAccount
    const getNonce = gql`
      query GetNonce($address: Address!, $chain: Chain!, $chainId: ChainId!) {
        user(identity: { address: $address, blockChain: { chain: $chain, chainId: $chainId } }) {
          nonce
        }
      }
    `
    const variables = {
      address: this.account,
      chain: this.chain,
      chainId: this.walletChainId
    }
    const nonce = await this.gqlClient.request(getNonce, variables)
    return nonce.user.nonce
  }

  public async getSignInToken({ message, signature }: { message: string; signature: string }) {
    const loginAuth = gql`
      mutation LoginAuth($identity: IdentityInput!, $message: String!, $signature: String!) {
        auth {
          login(input: { identity: $identity, message: $message, signature: $signature }) {
            token
          }
        }
      }
    `
    const loginVar = {
      identity: {
        address: this.account,
        blockChain: {
          chain: this.chain,
          chainId: this.walletChainId
        }
      },
      message,
      signature
    }

    const token = await this.gqlClient.request(loginAuth, loginVar)
    // console.log(token.auth.login.token)
    const bearerToken = `Bearer ${token.auth.login.token}`
    this.gqlClient = this.gqlClient.setHeader('Authorization', bearerToken)
    this.authToken = bearerToken
    return bearerToken
  }
}
