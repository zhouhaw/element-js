import { Contracts, approveERC1155TransferProxy, Order, checkOrder, CONTRACTS_ADDRESSES, Network } from '../src'
import Web3 from 'web3'

const HttpsProxyAgent = require('https-proxy-agent')
;(async () => {
  // http://39.102.101.142:8545
  // https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161
  let web3Provider = new Web3.providers.HttpProvider('http://39.102.101.142:8545', {
    agent: {
      http: new HttpsProxyAgent('http://127.0.0.1:9091'),
      https: new HttpsProxyAgent('http://127.0.0.1:9091')
    }
  })
  const constracts = new Contracts(new Web3('http://localhost:8545'), { networkName: Network.Main })
  const account = '0xeA199722372dea9DF458dbb56be7721af117a9Bc'
  const erc1155Contract = constracts.erc1155.clone()
  erc1155Contract.options.address = CONTRACTS_ADDRESSES.main.ElementSharedAsset
  const operator = '0xeA199722372dea9DF458dbb56be7721af117a9Bc'
  const foo = erc1155Contract.methods.setApprovalForAll(operator, true)
  console.log(foo)
  let res = await foo.send({ from: account })
  console.log(res)
  const proxyRegistryContract = constracts.exchangeProxyRegistry
  await approveERC1155TransferProxy({ proxyRegistryContract, erc1155Contract, account })
})()
