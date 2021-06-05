import { Base } from './base'

import { transferFromERC1155, orderFromJSON } from '../src/utils'

import {
  Asset,
  ElementSchemaName,
  getAccountBalance,
  Network,
  getAccountNFTsBalance,
  getTokenIDOwner,
  Orders,
  NULL_ADDRESS
} from '../src'
;(async () => {
  let base = new Base()
  await base.init()
  let sellAccount = base.accounts[1].address
  let buyAccount = base.accounts[0].address
  const order = base.orders
  const payToken = order.erc20.clone()
  let wETHAddr = order.WETHAddr
  payToken.options.address = wETHAddr
  let bal = await getAccountBalance(order.web3, sellAccount, payToken)

  // let tokenId = '33716853113536161489978336371468443552125006904605057389181032262111709888513'

  let tokenId = '52110910509117159886520023034677676808462086871028572901793699467778513174529'
  let assetAddr = order.elementSharedAssetAddr.toLowerCase()

  //---------- match order buy--------

  // 检查买家是否有 资产
  const buyNFTs = order.erc1155.clone()
  buyNFTs.options.address = assetAddr
  let assetBal = await getAccountNFTsBalance(buyNFTs, sellAccount, tokenId)

  if (assetBal == 0) {
    // let tx = await transferFromERC1155(buyNFTs, buyAccount, sellAccount, tokenId)
    // console.log('transferFromERC1155 to Sell', tx)
    let acc = sellAccount
    sellAccount = buyAccount
    buyAccount = acc
    // return
  }

  console.log('sellAccount balance', assetBal)

  let asset = {
    tokenId,
    tokenAddress: assetAddr,
    schemaName: ElementSchemaName.ERC1155
  } as Asset

  const sellParm = {
    accountAddress: sellAccount,
    paymentTokenAddress: wETHAddr,
    asset,
    startAmount: 0.00012,
    feeRecipient: NULL_ADDRESS
  }
  base.web3.eth.defaultAccount = sellAccount
  let sell = await order.createSellOrder(sellParm)

  const buyParm = {
    accountAddress: buyAccount,
    paymentTokenAddress: wETHAddr,
    asset,
    startAmount: 0.00012
  }

  base.web3.eth.defaultAccount = buyAccount
  let buy = await order.createBuyOrder(buyParm)

  console.log('buy------\n', buy)

  console.log('sell----------\n', sell)
  // // buy 一口价
  buy = orderFromJSON(buy)
  sell = orderFromJSON(sell)

  // sell accept
  base.web3.eth.defaultAccount = sellAccount

  console.log('seller accept balance', sellAccount)
  let match = await order.matchOrder({ buy, sell, accountAddress: sellAccount })

  let newAssetBal = await getAccountNFTsBalance(buyNFTs, sellAccount, tokenId)

  console.log('order match ', match, assetBal, newAssetBal)
})()
