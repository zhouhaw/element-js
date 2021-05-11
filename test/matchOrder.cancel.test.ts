import { Base } from './base'

import {
  transferFromERC1155,
  getAccountBalance,
  getAccountNFTsBalance,
  orderFromJSON,
  approveTokenTransferProxy,
  approveERC1155TransferProxy
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

  console.log(bal)

  let tokenId = '52110910509117159886520023034677676808462086871028572901793699248975699247105'
  let assetAddr = order.elementSharedAssetAddr.toLowerCase() // ElementSharedAsset.networks[100].address

  const buyNFTs = order.erc1155.clone()
  buyNFTs.options.address = assetAddr
  let assetBal = await getAccountNFTsBalance(buyNFTs, sellAccount, tokenId)

  if (assetBal == 0) {
    await transferFromERC1155(buyNFTs, buyAccount, sellAccount, tokenId, 1)
    return
  }
  console.log(assetBal)

  let asset = {
    tokenId,
    tokenAddress: assetAddr,
    schemaName: ElementSchemaName.ERC1155
  } as Asset

  base.web3.eth.defaultAccount = sellAccount
  const sellParm = {
    accountAddress: sellAccount,
    paymentTokenAddress: wETHAddr,
    asset,
    startAmount: 0.12
  }
  let sellOrderJson = await order.createSellOrder(sellParm)

  if (sellOrderJson) {
    let sellOrder = orderFromJSON(sellOrderJson)

    let match = await order.cancelOrder({ order: sellOrder, accountAddress: base.web3.eth.defaultAccount })
    console.log(match, sellOrderJson)
  }
})()
