import { Contracts, CONTRACTS_ADDRESSES, ElementSchemaName, Network } from '../src'
import Web3 from 'web3'
import { approveSchemaProxy } from '../src/utils/approve'
import { ExchangeMetadata } from '../src/types'

const HttpsProxyAgent = require('https-proxy-agent')
;(async () => {
  // http://39.102.101.142:8545
  // https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161
  let web3Provider = new Web3.providers.HttpProvider('https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161')
  //, {
  //     agent: {
  //       http: new HttpsProxyAgent('http://127.0.0.1:9091'),
  //       https: new HttpsProxyAgent('http://127.0.0.1:9091')
  //     }
  //
  const web3 = new Web3(web3Provider)
  //0xeA199722372dea9DF458dbb56be7721af117a9Bc
  let account1 = web3.eth.accounts.wallet.add('53ce7e01dd100f3c71e10d9618c043139f336eb79a0562e034441b83a5e6db63')
  web3.eth.defaultAccount = account1.address.toLowerCase()

  const constracts = new Contracts(web3, { networkName: Network.Rinkeby })
  const orderMetadata: ExchangeMetadata = {
    asset: {
      id: '1',
      address: '0x1530272ce6e4589f5c09151a7c9a118a58d70e09'
    },
    schema: ElementSchemaName.CryptoKitties
  }
  await approveSchemaProxy({ contract: constracts, orderMetadata })
})()
