import { Base } from './base'

import { getAccountBalance, getAccountNFTsBalance, registerProxy, orderFromJSON } from '../src/utils'
import {
  Asset,
  ElementSchemaName,
  approveTokenTransferProxy,
  approveERC1155TransferProxy,
  Network,
  Orders
} from '../src'

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

  let tokenId = '1'
  let assetAddr = '0x626743a83D7daD4896F08f06dAf4066F1A20bF24'
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

  // 检查买家是否授权 WETH
  // let isTransferProxy = await approveTokenTransferProxy(base.contracts.exchange, payToken, buyAccount)

  // if (!isTransferProxy) {
  //   console.log('isTransferProxy')
  //   return
  // }

  //---------- match order buy--------

  // 检查买家是否有 资产
  const buyNFTs = order.erc1155.clone()
  buyNFTs.options.address = assetAddr
  let assetBal = await getAccountNFTsBalance(buyNFTs, sellAccount, tokenId)

  // 检查卖家是否授权 NFTs
  let isERC1155TransferProxy = await approveERC1155TransferProxy(
    base.contracts.exchangeProxyRegistry,
    buyNFTs,
    sellAccount
  )

  if (!isERC1155TransferProxy) {
    console.log('isERC1155TransferProxy')
    return
  }

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
