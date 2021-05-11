import { Base } from './base'

import {
  transferFromERC1155,
  getAccountBalance,
  getAccountNFTsBalance,
  registerProxy,
  approveTokenTransferProxy,
  approveERC1155TransferProxy,
  orderFromJSON
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

  let tokenId = '1'
  let assetAddr = '0x626743a83D7daD4896F08f06dAf4066F1A20bF24'

  //---------- match order buy--------

  // 检查买家是否有 资产
  const buyNFTs = order.erc1155.clone()
  buyNFTs.options.address = assetAddr
  let assetBal = await getAccountNFTsBalance(buyNFTs, sellAccount, tokenId)

  if (assetBal == 0) {
    let tx = await transferFromERC1155(buyNFTs, buyAccount, sellAccount, tokenId)
    console.log('transferFromERC1155 Sell to NFTs', tx)
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

  // sell accept
  // buy = orderFromJSON(buy)
  // base.web3.eth.defaultAccount = sellAccount
  // let match = await order._matchOrder({ buy, sell, accountAddress: sellAccount })

  // buy 一口价
  sell = orderFromJSON(sell)
  base.web3.eth.defaultAccount = buyAccount
  let match = await order.matchOrder({ buy, sell, accountAddress: buyAccount })

  let newAssetBal = await getAccountNFTsBalance(buyNFTs, sellAccount, tokenId)
  console.log('order match ', match, assetBal, newAssetBal)
})()
