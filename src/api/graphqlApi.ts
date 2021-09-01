import { gql, GraphQLClient } from 'graphql-request'
import { elementSignInSign, Network, Orders } from '../index'
import { ElementAPIConfig } from '../types'
import hmacSHA256 from 'crypto-js/hmac-sha256'
import { API_BASE_URL, CHAIN_ID } from '../utils/constants'

export class GraphqlApi implements ElementAPIConfig {
  public networkName: Network
  public networkID: number
  public authToken: string
  public chain = 'eth'
  public chainId: number
  public walletChainId: string

  /**
   * Base url for the API
   */
  public readonly apiBaseUrl: string

  public gqlClient: GraphQLClient
  /**
   * Logger function to use when debugging
   */
  public logger: (arg: string) => void
  private appKey
  private appSecret

  /**
   * Create an instance of the Element API
   * @param config ElementAPIConfig for setting up the API, including an optional API key, network name, and base URL
   * @param logger Optional function for logging debug strings before and after requests are made
   */
  constructor(config: ElementAPIConfig, logger?: (arg: string) => void) {
    const _network: Network = config.networkName
    this.apiBaseUrl = config.apiBaseUrl || API_BASE_URL[_network].api
    this.networkID = CHAIN_ID[_network]
    this.appKey = API_BASE_URL[_network].key
    this.appSecret = API_BASE_URL[_network].secret

    if (!this.apiBaseUrl) {
      throw new Error(`${_network} undefined api`)
    }

    if (_network === Network.Main) {
      this.chain = 'eth'
    }

    if (_network === Network.Rinkeby) {
      this.chain = 'eth'
    }

    if (_network === Network.Mumbai) {
      this.chain = 'polygon'
    }

    if (_network === Network.Polygon) {
      this.chain = 'polygon'
    }
    this.chainId = this.networkID
    this.walletChainId = `0x${this.chainId.toString(16)}`

    this.networkName = _network
    this.authToken = ''
    const getSign = this.getAPISign()
    this.gqlClient = new GraphQLClient(`${this.apiBaseUrl}/graphql`, { headers: { ...getSign } })
    this.logger = logger || ((arg: string) => arg)
  }

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

  private async getNewNonce(walletProvider: any) {
    const accountAddress = walletProvider.eth.defaultAccount
    const getNonce = gql`
      query GetNonce($address: Address!, $chain: Chain!, $chainId: ChainId!) {
        user(identity: { address: $address, blockChain: { chain: $chain, chainId: $chainId } }) {
          nonce
        }
      }
    `
    const variables = {
      address: accountAddress,
      chain: this.chain,
      chainId: this.walletChainId
    }
    const nonce = await this.gqlClient.request(getNonce, variables)
    return nonce.user.nonce
  }

  public async getSignInToken(walletProvider: any) {
    const accountAddress = walletProvider.eth.defaultAccount
    this.gqlClient = this.gqlClient.setHeader('X-Viewer-Addr', accountAddress)
    const nonce = await this.getNewNonce(walletProvider)
    const { message, signature } = await elementSignInSign(walletProvider, nonce, accountAddress)
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
        address: accountAddress,
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
