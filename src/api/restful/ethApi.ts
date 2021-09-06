import Web3 from 'web3'
import { Fetch } from './base'
export { Web3 }
export class EthApi extends Fetch {
  public rpcUrl: string
  public web3SDK: Web3

  constructor(providerUrl: string) {
    super(providerUrl)
    this.rpcUrl = providerUrl
    this.web3SDK = new Web3(providerUrl)
  }

  public async getTransactionCount(account: string): Promise<number> {
    return this.web3SDK.eth.getTransactionCount(account)
  }

  public async estimateGas(to: string, data: string): Promise<number> {
    return this.web3SDK.eth.estimateGas({ to, data })
  }

  public async getGasPrice(type = 'eth'): Promise<number> {
    if (type == 'gasnow') {
      const res: any = await this.get('https://www.gasnow.org/api/v3/gas/price')
      return res.data.data.rapid
    }
    return Number(this.web3SDK.eth.getGasPrice())
  }

  public async getSendTx({ from, to, data, value = 0 }: { from: string; to: string; data: string; value?: number }) {
    const gas = await this.estimateGas(to, data)
    const nonce = await this.getTransactionCount(from)
    const gasPrice = await this.getGasPrice()
    return {
      from,
      to,
      value,
      gas,
      gasPrice,
      nonce,
      data
    }
  }

  public async sendTransaction({
    from,
    to,
    data,
    value = 0
  }: {
    from: string
    to: string
    data: string
    value?: number
  }) {
    const transactionObject = await this.getSendTx({ from, to, data, value })
    await this.web3SDK.eth.sendTransaction(transactionObject)
  }

  public async contractCall(to: string, data: string) {
    const _body = {
      method: 'eth_call',
      params: [
        {
          to,
          data
        },
        'latest'
      ]
    }
    return fetch(this.rpcUrl, _body).catch((e) => {
      throw e
    })
  }
}

// public async getCallData({schemaName,networkName}:{schemaName:ElementSchemaName,networkName:Network}) {
//
//     const schemas = getSchemaList(networkName, schemaName)
//     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//     // @ts-ignore
//     const accountApprove = schema?.functions?.approve(elementAsset, operator)
//     const callData = encodeCall(accountApprove, [operator, asset.tokenId])
// }
