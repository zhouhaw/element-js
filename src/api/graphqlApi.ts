import { gql, GraphQLClient } from 'graphql-request'
import { elementSignInSign, Network } from '../index'
import { ElementAPIConfig } from '../types'
import { API_BASE_URL, CHAIN_ID } from '../utils/constants'

export class GraphqlApi implements ElementAPIConfig {
  public networkName: Network
  public networkID: number
  public authToken: string
  public chain = 'eth'

  /**
   * Base url for the API
   */
  public readonly apiBaseUrl: string

  public gqlClient: GraphQLClient
  /**
   * Logger function to use when debugging
   */
  public logger: (arg: string) => void

  /**
   * Create an instance of the Element API
   * @param config ElementAPIConfig for setting up the API, including an optional API key, network name, and base URL
   * @param logger Optional function for logging debug strings before and after requests are made
   */
  constructor(config: ElementAPIConfig, logger?: (arg: string) => void) {
    switch (config.networkName) {
      case Network.Rinkeby:
        this.apiBaseUrl = config.apiBaseUrl || API_BASE_URL.rinkeby
        this.networkID = CHAIN_ID.rinkeby
        break
      case Network.Main:
        this.apiBaseUrl = config.apiBaseUrl || API_BASE_URL.main
        this.networkID = CHAIN_ID.main
        break
      default:
        this.apiBaseUrl = config.apiBaseUrl || API_BASE_URL.main
        this.networkID = CHAIN_ID.main
        break
    }
    this.networkName = config.networkName
    this.authToken = ''

    this.gqlClient = new GraphQLClient(`${this.apiBaseUrl}/graphql`, { headers: {} })
    this.logger = logger || ((arg: string) => arg)
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
      chainId: `0x${this.networkID.toString(16)}`
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
          chainId: `0x${this.networkID.toString(16)}`
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
