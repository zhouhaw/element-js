import { Base } from './base'

import {
  approveERC1155TransferProxy,
  approveTokenTransferProxy,
  checkSenderOfAuthenticatedProxy,
  registerProxy
} from '../../src/utils/check'
import { Network } from '../../src'
;(async () => {
  let base = new Base()
  await base.init()
  let account = base.accounts[1].address

  try {
    // 检测执行 exchangeProxyRegistry 是否 授权 exchange 执行
    let isExchangeRegister = await checkSenderOfAuthenticatedProxy(
      base.contracts.exchange,
      base.contracts.authenticatedProxy,
      base.contracts.exchangeProxyRegistry,
      account
    )
    console.log('isExchangeRegister', isExchangeRegister)
  } catch (e) {
    console.log(e.code, e.message)
  }

  // let tokenList = getTokenList(Network.Private, 'WETH')

  // console.log(tokenList)

  let erc1155Contract = base.contracts.erc1155.clone()
  erc1155Contract.options.address = base.contracts.elementSharedAssetAddr
  let isERC1155Approve = await approveERC1155TransferProxy(
    base.contracts.exchangeProxyRegistry,
    erc1155Contract,
    account
  )
  console.log('isERC1155Approve', isERC1155Approve)

  let erc20Contract = base.contracts.erc20.clone()
  erc20Contract.options.address = base.contracts.WETHAddr
  let isTokenApprove = await approveTokenTransferProxy(base.contracts.exchange, erc20Contract, account)
  console.log('isTokenApprove', isTokenApprove)

  let isRegister = await registerProxy(base.contracts.exchangeProxyRegistry, account)
  console.log('isRegister', isRegister)
})()
