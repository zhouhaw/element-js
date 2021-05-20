import { Base } from './base'

import { NULL_ADDRESS } from '../src/utils/constants'
import { getAccountNFTsBalance } from '../src/utils/check'

import { orderFromJSON, transferFromERC1155 } from '../src/utils'
import { Asset, ElementSchemaName, Network, Orders, OrderCheckStatus } from '../src'
;(async () => {
  let base = new Base()
  await base.init()
  let sellAccount = base.accounts[0].address
  let buyAccount = base.accounts[1].address
  const order = base.orders
  let wETHAddr = NULL_ADDRESS

  // const payToken = order.erc20.clone()
  // let wETHAddr = order.WETHAddr
  // payToken.options.address = wETHAddr
  // let bal = await getAccountBalance(order.web3, buyAccount, payToken)
  let tokenId = '52110910509117159886520023034677676808462086871028572901793699248975699247105'
  let assetAddr = order.elementSharedAssetAddr.toLowerCase() // ElementSharedAsset.networks[100].address

  let asset = {
    tokenId,
    tokenAddress: assetAddr,
    schemaName: ElementSchemaName.ERC1155
  } as Asset

  const sellParm = {
    asset,
    accountAddress: sellAccount,
    startAmount: 0.12,
    endAmount: 0.1,
    paymentTokenAddress: wETHAddr,
    expirationTime: 1621509587
  }
  //     endAmount: 0.1,
  // expirationTime: 0 // 1621509587
  base.web3.eth.defaultAccount = sellAccount
  let sellOrderJson = await order.createSellOrder(sellParm)

  //------createBuyOrder
  const buyParm = {
    accountAddress: buyAccount,
    paymentTokenAddress: wETHAddr,
    asset,
    startAmount: 0.12,
    endAmount: 0.1,
    sellOrder: orderFromJSON(sellOrderJson)
  }

  function next<OrderCheckStatus>(arg: OrderCheckStatus) {
    console.log(arg)
  }

  base.web3.eth.defaultAccount = buyAccount
  const buyOrder = await order.createBuyOrder(buyParm, { next })
  // console.log('buyOrder', buyOrder)

  //------createSellOrder

  const buyNFTs = order.erc1155.clone()
  buyNFTs.options.address = assetAddr
  let assetBal = await getAccountNFTsBalance(buyNFTs, sellAccount, tokenId)

  if (assetBal == 0) {
    let tx = await transferFromERC1155(buyNFTs, buyAccount, sellAccount, tokenId, 1)
    console.log('transferFromERC1155 to Sell', tx)
    return
  }

  console.log('sellOrder', { buy: buyOrder, sell: sellOrderJson })
})()
