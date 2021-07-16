import { Base } from './base'

import {
  getAccountBalance,
  getAccountNFTsBalance,
  registerProxy,
  approveTokenTransferProxy,
  approveERC1155TransferProxy,
  getTokenIDOwner,
  checkRegisterProxy,
  checkApproveTokenTransferProxy,
  checkApproveERC1155TransferProxy
} from '../../src/utils/check'
;(async () => {
  let base = new Base()

  await base.init()
  let tokenId = '33716853113536161489978336371468443552125006904605057389181166721388670615553'
  let sellAccount = base.accounts[3].address

  const order = base.orders
  const payToken = order.erc20.clone()
  let wETHAddr = order.WETHAddr
  payToken.options.address = wETHAddr

  // let bal = await checkApproveTokenTransferProxy(order.exchange, payToken, payToken)

  let bal = await getAccountBalance(order.web3, sellAccount, payToken)
  let isApproveTokenTransfer = await approveTokenTransferProxy(order.exchange, payToken, sellAccount)

  console.log('token balance isApproveTokenTransfer', bal, isApproveTokenTransfer)

  let buyRegister = await checkRegisterProxy(order.exchangeProxyRegistry, sellAccount)
  console.log(' Register', buyRegister)

  //  检查买家是否有 资产
  let assetAddr = order.elementSharedAssetAddr.toLowerCase()
  const buyNFTs = order.erc1155.clone()
  buyNFTs.options.address = assetAddr
  let assetBal = await getAccountNFTsBalance(buyNFTs, sellAccount, tokenId)
  let isApproveERC1155TransferProxy = await checkApproveERC1155TransferProxy(
    order.exchangeProxyRegistry,
    buyNFTs,
    sellAccount
  )

  console.log('nfts balance and  ApproveERC1155TransferProxy ', assetBal, isApproveERC1155TransferProxy)

  // token id owner
  let owner = await getTokenIDOwner(base.contracts.elementSharedAsset, tokenId)
  // 如对应token id 的资产未创建 未false
  let exists = await order.elementSharedAsset.methods.exists(tokenId).call()
  // 验证创建者是否拥有
  let ownerBal = await order.elementSharedAsset.methods.balanceOf(owner, tokenId).call()

  console.log('tokenId owner %s exists %s exists ownerBal %s ', owner, exists, ownerBal)

  //
})()
