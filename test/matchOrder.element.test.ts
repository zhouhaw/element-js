import { Base } from './base'

import {
  transferFromERC1155,
  getAccountBalance,
  getAccountNFTsBalance,
  registerProxy,
  approveTokenTransferProxy,
  approveERC1155TransferProxy,
  orderFromJSON,
  getTokenIDOwner
} from '../src/utils'
import { Asset, ElementSchemaName, Network, Orders } from '../src'
;(async () => {
  let base = new Base()
  await base.init()
  let sellAccount = base.accounts[0].address
  let buyAccount = base.accounts[1].address
  const order = base.orders
  const payToken = order.erc20.clone()
  let wETHAddr = order.WETHAddr
  payToken.options.address = wETHAddr
  let bal = await getAccountBalance(order.web3, buyAccount, payToken)

  let tokenId = '52110910509117159886520023034677676808462086871028572901793699248975699247105'
  // let tokenId = '52110910509117159886520023034677676808462086871028572901793699467778513174529'
  let assetAddr = order.elementSharedAssetAddr.toLowerCase()

  //---------- match order buy--------

  // 检查买家是否有 资产
  const buyNFTs = order.erc1155.clone()
  buyNFTs.options.address = assetAddr
  let assetBal = await getAccountNFTsBalance(buyNFTs, sellAccount, tokenId)

  if (assetBal == 0) {
    let tx = await transferFromERC1155(buyNFTs, buyAccount, sellAccount, tokenId)
    console.log('transferFromERC1155 to Sell', tx)
    return
  }

  let asset = {
    tokenId,
    tokenAddress: assetAddr,
    schemaName: ElementSchemaName.ERC1155
  } as Asset

  const sellParm = {
    accountAddress: sellAccount,
    paymentTokenAddress: wETHAddr,
    asset,
    startAmount: 0.12
  }
  base.web3.eth.defaultAccount = sellAccount
  let sell = await order.createSellOrder(sellParm)

  const buyParm = {
    accountAddress: buyAccount,
    paymentTokenAddress: wETHAddr,
    asset,
    startAmount: 0.12
  }

  base.web3.eth.defaultAccount = buyAccount
  let buy = await order.createBuyOrder(buyParm)

  let owner = await getTokenIDOwner(base.contracts.elementSharedAsset, sell.metadata.asset.id)
  let sellIsOwner = sell.maker.toLowerCase() == owner.toLowerCase()
  if (!sellIsOwner) {
    return false
  }

  // sell accept
  sell = orderFromJSON(sell)
  buy = orderFromJSON(buy)
  base.web3.eth.defaultAccount = sellAccount
  let match = await order.matchOrder({ buy, sell, accountAddress: sellAccount })

  // // buy 一口价
  // buy = orderFromJSON(buy)
  // sell = orderFromJSON(sell)
  // base.web3.eth.defaultAccount = buyAccount
  // let match = await order.matchOrder({ buy, sell, accountAddress: buyAccount })

  let newAssetBal = await getAccountNFTsBalance(buyNFTs, sellAccount, tokenId)

  console.log('order match ', match, assetBal, newAssetBal)
})()
