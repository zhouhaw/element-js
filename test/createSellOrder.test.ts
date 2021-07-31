import { Orders, Network, ElementSchemaName } from '../src'
import Web3 from 'web3'

const HttpsProxyAgent = require('https-proxy-agent')

;(async () => {
  // http://39.102.101.142:8545
  // https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161
  // https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161
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

  try {
    web3.eth.defaultAccount = account1.address.toLowerCase()
    const orderData = new Orders(web3, { networkName: Network.Rinkeby })

    const sellAsset = {
      tokenId: '1',
      // tokenAddress: '0x06012c8cf97bead5deae237070f9587f8e7a266d', Main
      tokenAddress: '0x1530272ce6e4589f5c09151a7c9a118a58d70e09',
      schemaName: ElementSchemaName.CryptoKitties
    }

    const sellParams = {
      asset: sellAsset,
      accountAddress: account1.address.toLowerCase(),
      startAmount: 0.0001
    }
    console.log(sellParams)
    const sellData = await orderData.createSellOrder(sellParams)
    console.log(sellData)
  } catch (e) {
    console.log(e)
  }
})()
