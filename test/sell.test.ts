import fetchNode from 'node-fetch'
import Web3 from 'web3'
import { getTokenList, Network, Orders } from '../src'

import { UnhashedOrder } from '../src/types'

import * as ordersJSONFixture from '../abi/orders.json'

const ordersJSON = ordersJSONFixture as any
const englishSellOrderJSON = ordersJSON[0] as UnhashedOrder

// let web3 = new Web3('http://39.102.101.142:8555') // net id 8555
const web3 = new Web3('http://39.102.101.142:8545') // net id 100
const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'

const go = async () => {
  const foo = await fetchNode(
    'http://www.ruanyifeng.com/blog/2020/12/fetch-tutorial.html',
    {
      timeout: 2000
    }
  )
  console.log(foo.status)
};

(async () => {
  try {
    const list = getTokenList(Network.Rinkeby)

    // let foo = getSchema(Network.Rinkeby, ElementSchemaName.ERC1155)
    const networkID: number = await web3.eth.net.getId()
    const account = '0x9F7A946d935c8Efc7A8329C0d894A69bA241345A'
    const order = new Orders(web3, {
      networkName: Network.Private,
      networkID,
      account
    })

    web3.eth.accounts.wallet.add(
      '0x078bad8a23809d79c021f84e6c56e900f8082b05e51872e32361ada65a144dea'
    )
    // web3.eth.accounts.wallet.add('0x59ae5462c42c8b9e4a7c760f4021fdfd1ae551a42ae3a7261ecd21c747bfef89')

    const sellAccount = web3.eth.accounts.wallet[0].address
    web3.eth.defaultAccount = sellAccount
    // const buyAccount = web3.eth.accounts.wallet[1].address

    const okParm = {
      accountAddress: sellAccount,
      asset: {
        tokenId:
          '72134322679254813612560192230305857957633912505434515263987832381968402612225',
        tokenAddress: '0x0d59ae1af62ceef6f31f38df881911b408e114bc',
        "name": "ERC1155"
      },
      startAmount: 2000,
      paymentTokenAddress: '0x92893Ed51e36243d30BD51f805A7eC3b83fD938c',
      "expirationTime": 0
    }

    console.log(sellAccount)

    const postData = await order.createSellOrder(okParm)
    console.log(postData)
    // const parms = {
    //   asset: {
    //     tokenId:
    //       '72134322679254813612560192230305857957633912505434515263987832381968402612225',
    //     tokenAddress: '0x0d59ae1af62ceef6f31f38df881911b408e114bc',
    //     name: 'ERC1155'
    //   },
    //   accountAddress: sellAccount,
    //   startAmount: 23452345,
    //   paymentTokenAddress: '0x0000000000000000000000000000000000000000',
    //   expirationTime: 1619952600000
    // }
    // let postData = await order._makeSellOrder({
    //   quantity: 1,
    //   accountAddress: '0x7335bae9c88c59382621a2fbe08a353a93510f56',
    //   asset: {
    //     tokenId: '72134322679254813612560192230305857957633912505434515263987832381968402612225',
    //     tokenAddress: '0x0d59ae1af62ceef6f31f38df881911b408e114bc'
    //   },
    //   waitForHighestBid: false,
    //   startAmount: 0,
    //   extraBountyBasisPoints: 0,
    //   expirationTime: 0,
    //   paymentTokenAddress: NULL_ADDRESS,
    //   buyerAddress: NULL_ADDRESS
    // })

    // let hash3 = await getOrderHash(exchangeHelper, postData)

    // const hashedOrder: UnsignedOrder = {
    //   ...postData,
    //   hash: hashOrder(web3, postData)
    // }
    //
    // let hh = await getOrderHash(order.exchangeHelper, postData)
    // let oo = orderToJSON(hashedOrder)

    // console.log(hh)

    // await go()
  } catch (error) {
    console.log(error)
  }
})()
