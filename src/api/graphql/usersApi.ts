import { GraphQLClient } from 'graphql-request'
import { ElementAPIConfig, Network, Token } from '../../types'
import hmacSHA256 from 'crypto-js/hmac-sha256'
import { API_BASE_URL, CHAIN, CHAIN_ID } from '../config'
import { getNonce, loginAuth, userAssetsList, accountOrders } from './gql/user'
import { GraphqlApi } from './base'

export class UsersApi extends GraphqlApi {
  public async getNewNonce(): Promise<number> {
    const variables = {
      address: this.account,
      chain: this.chain,
      chainId: this.walletChainId
    }
    const nonce = await this.gqlClient.request(getNonce, variables)
    return nonce.user.nonce
  }

  public async getSignInToken({ message, signature }: { message: string; signature: string }) {
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

  public async getUserAssetsList() {
    const variables = {
      first: 20,
      identity: {
        address: this.account,
        blockChain: {
          chain: this.chain,
          chainId: this.walletChainId
        }
      }
    }
    this.gqlClient = this.gqlClient.setHeader('X-Query-Args', 'UserAssetsList')
    return await this.gqlClient.request(userAssetsList, variables)
  }

  public async getAccountOrders() {
    const variables = {
      first: 20,
      identity: {
        address: this.account,
        blockChain: {
          chain: this.chain,
          chainId: this.walletChainId
        }
      },
      orderType: 0 //报价
    }
    this.gqlClient = this.gqlClient.setHeader('X-Query-Args', 'AccountOrders')
    return await this.gqlClient.request(accountOrders, variables)
  }
}
