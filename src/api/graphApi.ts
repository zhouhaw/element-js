import { request, gql, GraphQLClient } from 'graphql-request'
import { elementSignInSign, Network } from '../../src'
import { ElementAPIConfig } from '../types'
import { ORDERBOOK_PATH } from '../utils/constants'

export class GraphAPI {
  /**
   * Base url for the API
   */
  public readonly graphqlUrl: string
  /**
   * Logger function to use when debugging
   */
  public logger: (arg: string) => void

  /**
   * Create an instance of the OpenSea API
   * @param config OpenSeaAPIConfig for setting up the API, including an optional API key, network name, and base URL
   * @param logger Optional function for logging debug strings before and after requests are made
   */
  constructor(config: ElementAPIConfig, logger?: (arg: string) => void) {
    // this.apiKey = config.apiKey
    switch (config.networkName) {
      case Network.Rinkeby:
        this.graphqlUrl = config.apiBaseUrl || ORDERBOOK_PATH.rinkeby
        break
      case Network.Main:
        this.graphqlUrl = config.apiBaseUrl || ORDERBOOK_PATH.main
        break
      default:
        this.graphqlUrl = config.apiBaseUrl || ORDERBOOK_PATH.main
        break
    }
    // Debugging: default to nothing
    this.logger = logger || ((arg: string) => arg)
  }

  private async getNewNonce(walletProvider: any) {
    const accountAddress = walletProvider.eth.defaultAccount
    const endpoint = this.graphqlUrl
    const getNonce = gql`
      query GetNonce($address: Address!, $chain: Chain!, $chainId: ChainId!) {
        user(identity: { address: $address, blockChain: { chain: $chain, chainId: $chainId } }) {
          nonce
        }
      }
    `
    const variables = {
      address: accountAddress,
      chain: 'eth',
      chainId: '0x1'
    }
    let nonce = await request(endpoint, getNonce, variables)
    console.log(nonce)
    return nonce.user.nonce
  }

  public async getSignInToken(walletProvider: any) {
    const accountAddress = walletProvider.eth.defaultAccount
    const endpoint = this.graphqlUrl
    let nonce = await this.getNewNonce(walletProvider)
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
          chain: 'eth',
          chainId: '0x1'
        }
      },
      message,
      signature
    }

    let token = await request(endpoint, loginAuth, loginVar)
    console.log(token)
  }
}
// ;(async () => {
//   const endpoint = 'http://39.96.19.41:8000/graphql'
//   const privateKey = '6b3d62de1c55740660693db23917efff49306f4d6616c145d98a4a2d7a740caa'
//   const walletProvider = new Web3()
//   const account = walletProvider.eth.accounts.wallet.add(privateKey)
//
// })()
