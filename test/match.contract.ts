import { Base } from './base'

import {
  getAccountBalance,
  getAccountNFTsBalance,
  registerProxy,
  approveTokenTransferProxy,
  approveERC1155TransferProxy,
  orderFromJSON
} from '../src/utils'
import { Asset, ElementSchemaName, Network, Orders } from '../src'

async function transferFromERC1155(
  nftsContract: any,
  from: string,
  to: string,
  tokenId: any,
  amount: number = 1
): Promise<boolean> {
  let tx = await nftsContract.methods.safeTransferFrom(from, to, tokenId, amount, '0x').call()
  return tx.status
}
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
  let assetAddr = order.elementSharedAssetAddr.toLowerCase() // ElementSharedAsset.networks[100].address

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
  let sellOrderJson = await order.createSellOrder(sellParm)

  //---------- match order buy--------

  // 检查买家是否有 资产
  const buyNFTs = order.erc1155.clone()
  buyNFTs.options.address = assetAddr
  let assetBal = await getAccountNFTsBalance(buyNFTs, sellAccount, tokenId)

  if (assetBal == 0) {
    await transferFromERC1155(buyNFTs, buyAccount, sellAccount, tokenId)
    console.log('transferFromERC1155 Sell to NFTs')
    return
  }

  let sellOrder = orderFromJSON(sellOrderJson)
  const matchParm = {
    sellOrder,
    accountAddress: buyAccount,
    paymentTokenAddress: wETHAddr,
    asset,
    startAmount: 0.12
  }

  const match = await order.matchOrder(matchParm)

  console.log('order match success')
})()
