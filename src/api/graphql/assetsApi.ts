import { ElementAPIConfig, Network, Token } from '../../types'
import { exploreAssetsList, assetsDetail, refreshMeta } from './gql/asset'
import { GraphqlApi } from './base'

export class AssetsApi extends GraphqlApi {
  /**
   * Create an instance of the Element API
   * @param config ElementAPIConfig for setting up the API, including an optional API key, network name, and base URL
   * @param logger Optional function for logging debug strings before and after requests are made
   */
  constructor(config: ElementAPIConfig) {
    super(config)
  }

  public async exploreAssetsList(params?: { first: 20 }) {
    return await this.blockChainRequest({ funcName: 'exploreAssetsList', gql: exploreAssetsList, params })
  }

  public async assetsDetail(params: { contractAddress: string; tokenId: string }) {
    return await this.blockChainRequest({ funcName: 'assetsDetail', gql: assetsDetail, params })
  }

  public async refreshMeta(params: { contractAddress: string; tokenId: string }) {
    return await this.putRequest({ funcName: 'refreshMeta', gql: refreshMeta, params })
  }
}

// {
//   input: {
//     blockChain: {
//       chain: 'eth',
//           chainId: '0x1'
//     },
//     contractAddress: '0x2debd05a915b8a79c8ef878db40e94e807646dd4',
//         tokenId: '7'
//   }
// }
