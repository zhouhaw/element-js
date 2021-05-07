import fetchNode from 'node-fetch'
import Web3 from 'web3'
import { Network, Orders } from '../src'

import { getOrderHash, hashOrder } from '../src/utils'

import { UnhashedOrder, UnsignedOrder } from '../src/types'

import * as ordersJSONFixture from '../abi/orders.json'

const ordersJSON = ordersJSONFixture as any
const englishSellOrderJSON = ordersJSON[0] as UnhashedOrder

// let web3 = new Web3('http://39.102.101.142:8555') // net id 8555
const web3 = new Web3('http://39.102.101.142:8545') // net id 100
const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'
const WETHAddr = '0x92893Ed51e36243d30BD51f805A7eC3b83fD938c'

const go = async () => {
  const foo = await fetchNode(
    'http://www.ruanyifeng.com/blog/2020/12/fetch-tutorial.html',
    {
      timeout: 2000
    }
  )
  console.log(foo.status)
}
const checkBuyAccountBalance = async (
  // eslint-disable-next-line @typescript-eslint/no-shadow
  web3: any,
  erc20: any,
  account: string
) => {
  const ethBal = await web3.eth.getBalance(account)
  if (Number(ethBal) == 0) {
    return false
  }
  console.log(`buyer ETH Balance: ${  ethBal}`)

  // let buyBal = await WETHContract.methods.balanceOf(buyAccount).call();
  const buyBal = await erc20.methods.balanceOf(account).call()
  if (Number(buyBal) == 0) {
    return false
  }
  console.log('buyAccount %s WETH balance %s', account, buyBal)
  return true
};

(async () => {
  try {
    // your private keys
    web3.eth.accounts.wallet.add(
      '0x078bad8a23809d79c021f84e6c56e900f8082b05e51872e32361ada65a144dea'
    )
    web3.eth.accounts.wallet.add(
      '0x59ae5462c42c8b9e4a7c760f4021fdfd1ae551a42ae3a7261ecd21c747bfef89'
    )

    const sellAccount = web3.eth.accounts.wallet[0].address
    const buyAccount = web3.eth.accounts.wallet[1].address

    console.log('sellAccount:%s, buyAccount: %s', sellAccount, buyAccount)

    web3.eth.defaultAccount = buyAccount

    // let foo = getSchema(Network.Rinkeby, ElementSchemaName.ERC1155)
    const networkID: number = await web3.eth.net.getId()
    const account = buyAccount

    // let oo = await getTokenBalance({
    //   web3,
    //   network: Network.Private,
    //   accountAddress: buyAccount,
    //   tokenAddress: WETHAddr
    // })
    const order = new Orders(web3, {
      networkName: Network.Private,
      networkID,
      account
    })
    const erc20 = order.erc20.clone()
    erc20.options.address = WETHAddr
    await checkBuyAccountBalance(web3, erc20, buyAccount)

    const okParm = {
      accountAddress: '0x7335bae9c88c59382621a2fbe08a353a93510f56',
      asset: {
        tokenId:
          '72134322679254813612560192230305857957633912505434515263987832381968402612225',
        tokenAddress: '0x0d59ae1af62ceef6f31f38df881911b408e114bc'
      },
      startAmount: 200
    }
    const ooo = await order.createBuyOrder(okParm)

    const postData = await order._makeBuyOrder({
      quantity: 1,
      accountAddress: '0x7335bae9c88c59382621a2fbe08a353a93510f56',
      asset: {
        tokenId:
          '72134322679254813612560192230305857957633912505434515263987832381968402612225',
        tokenAddress: '0x0d59ae1af62ceef6f31f38df881911b408e114bc'
      },
      referrerAddress: NULL_ADDRESS,
      startAmount: 0,
      extraBountyBasisPoints: 0,
      expirationTime: 0,
      paymentTokenAddress: WETHAddr
    })

    // let hash3 = await getOrderHash(exchangeHelper, postData)

    const hashedOrder: UnsignedOrder = {
      ...postData,
      hash: hashOrder(web3, postData)
    }

    const hh = await getOrderHash(web3, order.exchangeHelper, postData)
    // let oo = orderToJSON(hashedOrder)

    console.log(hh)

    // await go()
  } catch (error) {
    console.log(error)
  }
})()
