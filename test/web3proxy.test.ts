import { Contracts, approveERC1155TransferProxy, Order, checkOrder, CONTRACTS_ADDRESSES, Network } from '../src'
import Web3 from 'web3'

const HttpsProxyAgent = require('https-proxy-agent')

let order = {
  hash: '0x500cb25c764af45ce50d48d274477138e3c5c75939b80522d3e71e235ffa1d45',
  metadata: {
    asset: {
      id: '1123344',
      address: '0x60f80121c31a0d46b5279700f9df786054aa5ee5',
      quantity: '1',
      data: ''
    },
    schema: 'ERC721'
  },
  quantity: '1',
  exchange: '0x74d8e56924909731d0e65f954fc439fa04634a61',
  makerAccount: '0xea199722372dea9df458dbb56be7721af117a9bc',
  takerAccount: '0x0000000000000000000000000000000000000000',
  maker: '0xea199722372dea9df458dbb56be7721af117a9bc',
  taker: '0x0000000000000000000000000000000000000000',
  makerRelayerFee: '0',
  takerRelayerFee: '200',
  makerProtocolFee: '0',
  takerProtocolFee: '0',
  makerReferrerFee: '0',
  waitingForBestCounterOrder: false,
  feeMethod: 1,
  feeRecipientAccount: '0x7538262ae993ca117a0e481f908209137a46268e',
  feeRecipient: '0x7538262ae993ca117a0e481f908209137a46268e',
  side: 0,
  saleKind: 0,
  target: '0x60f80121c31a0d46b5279700f9df786054aa5ee5',
  howToCall: 0,
  dataToCall:
    '0x23b872dd0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ea199722372dea9df458dbb56be7721af117a9bc0000000000000000000000000000000000000000000000000000000000112410',
  replacementPattern:
    '0x00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
  staticTarget: '0x0000000000000000000000000000000000000000',
  staticExtradata: '0x',
  paymentToken: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  basePrice: '1000000000000000',
  extra: '0',
  currentBounty: '0',
  currentPrice: '0',
  createdTime: '1626151415',
  listingTime: '1626151297',
  expirationTime: '1626756180',
  salt: '29554484968140453397469727680945762762296208770192074884468589670980849223531',
  v: 28,
  r: '0x342a03cf231d74f56601805325c1c8c674f7b096e2df45e14080c2b204ef96e6',
  s: '0x1358a375170083d790a73637a08f2ba2f0394d8b829185e82dd70916e596e642',
  paymentTokenContract: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
}

;(async () => {
  // http://39.102.101.142:8545
  // https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161
  let web3Provider = new Web3.providers.HttpProvider('http://39.102.101.142:8545', {
    agent: {
      http: new HttpsProxyAgent('http://127.0.0.1:9091'),
      https: new HttpsProxyAgent('http://127.0.0.1:9091')
    }
  })
  // web3Provider
  // web3 需要设置环境变量 NODE_TLS_REJECT_UNAUTHORIZED = 0
  // web3Provider.httpAgent = new HttpsProxyAgent("http://127.0.0.1:9091")
  // web3Provider.httpsAgent = new HttpsProxyAgent("http://127.0.0.1:9091")
  // web3.eth.setProvider(web3Provider)// 为扫链简化请求

  const constracts = new Contracts(new Web3(web3Provider), { networkName: Network.Main })

  // http://node-eth-mainnet2.element.market:8545

  try {
    const foo = await checkOrder(constracts, (order as unknown) as Order)
    console.log(foo)
  } catch (e) {
    console.log(e)
  }

  // const account = '0xeA199722372dea9DF458dbb56be7721af117a9Bc'
  // const erc1155Contract = constracts.erc1155.clone()
  // erc1155Contract.options.address = CONTRACTS_ADDRESSES.private.ElementSharedAsset
  // const operator = '0xeA199722372dea9DF458dbb56be7721af117a9Bc'
  // const foo = erc1155Contract.methods.setApprovalForAll(operator, true)
  // console.log(foo)
  // let res = await foo.send({ from: account })
  // console.log(res)
  // await approveERC1155TransferProxy(constracts.exchangeProxyRegistry, erc1155Contract, account)
})()
