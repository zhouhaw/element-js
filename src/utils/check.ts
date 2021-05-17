import { getSchemaList, makeBigNumber, orderParamsEncode, orderSigEncode } from './markOrder'
import { encodeSell } from '../schema'
import { BigNumber, MAX_UINT_256, NULL_ADDRESS } from './constants'
import { Asset, ElementSchemaName, Network, Order, OrderSide } from '../types'
import { ElementError } from '../base/error'

const log = console.log
export async function checkSenderOfAuthenticatedProxy(
  exchangeContract: any,
  authenticatedProxyContract: any,
  proxyRegistryContract: any,
  account: string
): Promise<boolean> {
  let proxy = await proxyRegistryContract.methods.proxies(account).call()
  if (proxy == NULL_ADDRESS) {
    throw new ElementError({ code: 1001 })
  }
  let authProxyContract = authenticatedProxyContract.clone()
  authProxyContract.options.address = proxy

  let user = await authProxyContract.methods.user().call()
  if (user != account) {
    throw new ElementError({ code: 1001 })
  }
  // 查询用户授权的 proxy 执行合约地址
  let authproxyRegistryAddr = await authProxyContract.methods.registry().call()
  // 交易合约授权的 orderMatch 执行合约地址
  let exchangeProxyRegistryAddr = await exchangeContract.methods.registry().call()

  // 用户代理合约授权合约 和 和交易代理授权合约是否一致
  if (authproxyRegistryAddr != exchangeProxyRegistryAddr) {
    throw new ElementError({ code: 1002 })
  }

  // 用户交易的代理注册合约 和 代理注册合约是否一致
  if (authproxyRegistryAddr != proxyRegistryContract.options.address) {
    throw new ElementError({ code: 1002 })
  }

  // 验证交易合约是否为代理执行的合约地址
  let isPass = await proxyRegistryContract.methods.contracts(exchangeContract.options.address).call()

  if (!isPass) {
    throw new ElementError({ code: 1002 })
  }
  return true
}

export async function getAccountBalance(web3: any, account: string, erc20?: any): Promise<any> {
  let ethBal: number = await web3.eth.getBalance(account)
  let erc20Bal: number = 0
  if (erc20) {
    erc20Bal = await erc20.methods.balanceOf(account).call()
  }
  return { ethBal: Number(ethBal), erc20Bal: Number(erc20Bal) }
}

export async function getAccountNFTsBalance(nftsContract: any, account: string, tokenId: any): Promise<Number> {
  let bal = await nftsContract.methods.balanceOf(account, tokenId).call()
  return Number(bal)
}

export async function getTokenIDOwner(elementAssetContract: any, tokenId: any): Promise<string> {
  // token id 的 creator
  // let exists = await elementAssetContract.methods.exists(tokenId).call()
  return elementAssetContract.methods.creator(tokenId).call()
}

//1. check register
export async function checkRegisterProxy(proxyRegistryContract: any, account: string): Promise<boolean> {
  let proxy = await proxyRegistryContract.methods.proxies(account).call()
  if (proxy === NULL_ADDRESS) {
    throw new ElementError({ code: 1001 })
  }
  return true
}

//1.  register
export async function registerProxy(proxyRegistryContract: any, account: string): Promise<boolean> {
  let proxy = await proxyRegistryContract.methods.proxies(account).call()
  if (proxy === NULL_ADDRESS) {
    let res = await proxyRegistryContract.methods.registerProxy().send({
      from: account
    })
    if (!res.status) {
      throw new ElementError({ code: 2001, message: 'registerProxy()' })
    }
  }
  return true
}

//2 approve pay token
export async function checkApproveTokenTransferProxy(
  exchangeContract: any,
  erc20Contract: any,
  account: string
): Promise<boolean> {
  let tokenTransferProxyAddr = await exchangeContract.methods.tokenTransferProxy().call()
  // const amount = await erc20Contract.methods.balanceOf(account).call()
  // if (Number(amount) == 0) {
  //   throw new ElementError({ code: 1104 })
  // }
  const allowAmount = await erc20Contract.methods.allowance(account, tokenTransferProxyAddr).call()
  if (Number(allowAmount) == 0) {
    // console.log('checkApproveTokenTransferProxy allowAmount %s amount', allowAmount, amount)
    throw new ElementError({ code: 1101 })
  }
  return true
}

//2 approve pay token
export async function approveTokenTransferProxy(
  exchangeContract: any,
  erc20Contract: any,
  account: string
): Promise<boolean> {
  let tokenTransferProxyAddr = await exchangeContract.methods.tokenTransferProxy().call()
  const allowAmount = await erc20Contract.methods.allowance(account, tokenTransferProxyAddr).call()
  if (Number(allowAmount) == 0) {
    let res = await erc20Contract.methods.approve(tokenTransferProxyAddr, MAX_UINT_256).send({
      from: account
    })
    if (!res.status) {
      throw new ElementError({ code: 2001, message: 'tokenTransferProxyAddr approve()' })
    }
  }
  return true
}

export async function checkApproveERC1155TransferProxy(
  proxyRegistryContract: any,
  nftsContract: any,
  account: string
): Promise<boolean> {
  let operator = await proxyRegistryContract.methods.proxies(account).call()
  let isApprove = await nftsContract.methods.isApprovedForAll(account, operator).call()
  if (!isApprove) {
    throw new ElementError({ code: 1102 })
  }
  return isApprove
}

//3  approve 1155 NFTs to proxy
export async function approveERC1155TransferProxy(
  proxyRegistryContract: any,
  nftsContract: any,
  account: string
): Promise<boolean> {
  let operator = await proxyRegistryContract.methods.proxies(account).call()
  let isApprove = await nftsContract.methods.isApprovedForAll(account, operator).call()
  if (!isApprove) {
    let operator = await proxyRegistryContract.methods.proxies(account).call()
    let res = await nftsContract.methods.setApprovalForAll(operator, true).send({ from: account })

    if (!res.status) {
      throw new ElementError({ code: 2001, message: 'ERC1155 NFTs setApprovalForAll()' })
    }
  }
  return true
}

export async function checkApproveERC721TransferProxy(
  proxyRegistryContract: any,
  nftsContract: any,
  account: string,
  tokenID: string
): Promise<boolean> {
  let isApprove = await nftsContract.methods.getApproved(tokenID).call()
  if (!isApprove) {
    throw new ElementError({ code: 1102 })
  }
  return true
}

//4  approve 721 NFTs to proxy
export async function approveERC721TransferProxy(
  proxyRegistryContract: any,
  nftsContract: any,
  account: string,
  tokenID: string
): Promise<boolean> {
  let operator = await proxyRegistryContract.methods.proxies(account).call()
  let isApprove = await nftsContract.methods.getApproved(tokenID).call()
  if (!isApprove) {
    let res = await nftsContract.methods.approve(operator, tokenID).send({ from: account })
    if (!res.status) {
      throw new ElementError({ code: 2001, message: 'ERC721 NFTs approve()' })
    }
  }
  return true
}

export async function checkSellUser(contract: any, asset: Asset, paymentTokenAddr: string, accountAddress: string) {
  if (paymentTokenAddr == '') {
    paymentTokenAddr = NULL_ADDRESS
  }
  let { ethBal } = await getAccountBalance(contract.web3, accountAddress)
  if (ethBal == 0) {
    throw new ElementError({ code: 1105 })
  }

  const sellNFTs = contract.erc1155.clone()
  sellNFTs.options.address = asset.tokenAddress
  let bal = await getAccountNFTsBalance(sellNFTs, accountAddress, asset.tokenId)
  if (Number(bal) == 0) {
    throw new ElementError({ code: 1103 })
  }

  let isRegister = await checkRegisterProxy(contract.exchangeProxyRegistry, accountAddress)
  if (!isRegister) {
    await registerProxy(contract.exchangeProxyRegistry, accountAddress)
  }

  if (asset.schemaName == ElementSchemaName.ERC1155) {
    let isApproveERC1155 = await checkApproveERC1155TransferProxy(
      contract.exchangeProxyRegistry,
      sellNFTs,
      accountAddress
    )
    if (!isApproveERC1155) {
      await approveERC1155TransferProxy(contract.exchangeProxyRegistry, sellNFTs, accountAddress)
    }
  }

  if (paymentTokenAddr != NULL_ADDRESS) {
    let erc20Contract = contract.erc20.clone()
    erc20Contract.options.address = paymentTokenAddr

    let isApproveToken = await checkApproveTokenTransferProxy(contract.exchange, erc20Contract, accountAddress)
    if (!isApproveToken) {
      await approveTokenTransferProxy(contract.exchange, erc20Contract, accountAddress)
    }
  }

  return true
}

export async function checkBuyUser(contract: any, paymentTokenAddr: any, accountAddress: string) {
  let { ethBal } = await getAccountBalance(contract.web3, accountAddress)
  if (ethBal == 0) {
    throw new ElementError({ code: 1105 })
  }

  let isRegister = await checkRegisterProxy(contract.exchangeProxyRegistry, accountAddress)

  if (!isRegister) {
    await registerProxy(contract.exchangeProxyRegistry, accountAddress)
  }

  debugger
  let isApproveWETH = await checkApproveTokenTransferProxy(contract.exchange, contract.WETH, accountAddress)
  if (!isApproveWETH) {
    await approveTokenTransferProxy(contract.exchange, contract.WETH, accountAddress)
  }

  debugger
  // 直接购买 paytoken 可以为空
  if (paymentTokenAddr != NULL_ADDRESS) {
    let erc20Contract = contract.erc20.clone()
    erc20Contract.options.address = paymentTokenAddr
    let { erc20Bal } = await getAccountBalance(contract.web3, accountAddress, erc20Contract)
    if (erc20Bal == 0) {
      throw new ElementError({ code: 1104 })
    }
    let isApproveToken = await checkApproveTokenTransferProxy(contract.exchange, erc20Contract, accountAddress)
    if (!isApproveToken) {
      await approveTokenTransferProxy(contract.exchange, erc20Contract, accountAddress)
    }
  }
  debugger
  return true
}

export async function _checkMatchOrder(contract: any, buy: Order, sell: Order, accountAddress: string) {
  await checkRegisterProxy(contract.exchangeProxyRegistry, sell.maker)
  await checkRegisterProxy(contract.exchangeProxyRegistry, buy.maker)

  const equalPrice: boolean = buy.basePrice.gte(sell.basePrice)
  // const equalPrice: boolean = buy.basePrice == sell.basePrice
  if (!equalPrice) {
    throw new ElementError({ code: 1201 })
  }

  const sellNFTs = contract.erc1155.clone()
  sellNFTs.options.address = sell.metadata.asset.address
  let bal = await getAccountNFTsBalance(sellNFTs, sell.maker, sell.metadata.asset.id)
  if (bal == 0) {
    throw new ElementError({ code: 1103 })
  }

  let { ethBal } = await getAccountBalance(contract.web3, accountAddress)
  if (ethBal == 0) {
    throw new ElementError({ code: 1105 })
  }

  if (buy.paymentToken != NULL_ADDRESS) {
    let erc20Contract = contract.erc20.clone()
    erc20Contract.options.address = buy.paymentToken
    let { erc20Bal } = await getAccountBalance(contract.web3, buy.maker, erc20Contract)

    if (!makeBigNumber(erc20Bal).gte(buy.basePrice)) {
      throw new ElementError({ code: 1105 })
    }
    await checkApproveTokenTransferProxy(contract.exchange, erc20Contract, buy.maker)
  }

  if (sell.paymentToken != NULL_ADDRESS) {
    let erc20Contract = contract.erc20.clone()
    erc20Contract.options.address = sell.paymentToken
    await checkApproveTokenTransferProxy(contract.exchange, erc20Contract, sell.maker)
  }

  if (sell.metadata.schema == ElementSchemaName.ERC1155) {
    await checkApproveERC1155TransferProxy(contract.exchangeProxyRegistry, sellNFTs, sell.maker)
  }

  // let canMatch = await ordersCanMatch(buy, sell)
  await ordersCanMatch(contract.exchangeHelper, buy, sell)

  // // encodeSell
  // let schemas = getSchemaList(Network.Private, sell.metadata.schema)
  // let { target, dataToCall, replacementPattern } = encodeSell(schemas[0], sell.metadata.asset, sell.maker)
  //
  // if (dataToCall != sell.dataToCall) {
  //   console.log('sell.dataToCall error')
  // }
  //
  // if (target != sell.target) {
  //   console.log('sell.target error')
  // }
  //
  // if (replacementPattern != sell.replacementPattern) {
  //   console.log('sell.replacementPattern error')
  // }

  await validateOrder(contract.exchangeHelper, buy)
  await validateOrder(contract.exchangeHelper, sell)

  return true
}

export async function checkMatchOrder(contract: any, buy: Order, sell: Order, accountAddress: string) {
  const equalPrice: boolean = buy.basePrice.gte(sell.basePrice)
  // const equalPrice: boolean = buy.basePrice == sell.basePrice
  if (!equalPrice) {
    throw new ElementError({ code: 1201 })
  }
  await checkOrder(contract, buy)
  await checkOrder(contract, sell)

  return true
}

export async function checkOrder(contract: any, order: Order) {
  await checkRegisterProxy(contract.exchangeProxyRegistry, order.maker)
  const equalPrice: boolean = order.basePrice.gt(0)
  if (!equalPrice) {
    throw new ElementError({ code: 1201 })
  }

  await validateOrder(contract.exchangeHelper, order)

  let { ethBal } = await getAccountBalance(contract.web3, order.maker)
  if (ethBal == 0) {
    throw new ElementError({ code: 1105 })
  }

  // 检查 Sell 买单 Buy = 0, Sell = 1
  if (order.side == OrderSide.Sell) {
    let sell = order
    const sellNFTs = contract.erc1155.clone()
    sellNFTs.options.address = sell.metadata.asset.address
    let bal = await getAccountNFTsBalance(sellNFTs, sell.maker, sell.metadata.asset.id)
    if (bal == 0) {
      throw new ElementError({ code: 1103 })
    }

    if (sell.paymentToken != NULL_ADDRESS) {
      let erc20Contract = contract.erc20.clone()
      erc20Contract.options.address = sell.paymentToken
      await checkApproveTokenTransferProxy(contract.exchange, erc20Contract, sell.maker)
    }

    if (sell.metadata.schema == ElementSchemaName.ERC1155) {
      await checkApproveERC1155TransferProxy(contract.exchangeProxyRegistry, sellNFTs, sell.maker)
    }
    checkDataToCall(contract.networkName, sell)
  }

  // 检查 Buy 卖单
  if (order.side == OrderSide.Buy) {
    let buy = order
    if (buy.paymentToken !== NULL_ADDRESS) {
      let erc20Contract = contract.erc20.clone()
      erc20Contract.options.address = buy.paymentToken
      let { erc20Bal } = await getAccountBalance(contract.web3, buy.maker, erc20Contract)

      if (!makeBigNumber(erc20Bal).gte(buy.basePrice)) {
        throw new ElementError({ code: 1105 })
      }
      await checkApproveTokenTransferProxy(contract.exchange, erc20Contract, buy.maker)
    } else {
      if (
        contract.web3.eth.defaultAccount &&
        contract.web3.eth.defaultAccount.toLowerCase() != buy.maker.toLowerCase()
      ) {
        throw new ElementError({ code: 1204 })
      }
    }
  }
  return true
}

export function checkDataToCall(netWorkName: Network, sell: Order) {
  // encodeSell
  let schemas = getSchemaList(netWorkName, sell.metadata.schema)
  let { target, dataToCall, replacementPattern } = encodeSell(schemas[0], sell.metadata.asset, sell.maker)

  if (dataToCall != sell.dataToCall) {
    console.log('sell.dataToCall error')
  }

  if (target != sell.target) {
    console.log('sell.target error')
  }

  if (replacementPattern != sell.replacementPattern) {
    console.log('sell.replacementPattern error')
  }
}

export async function validateOrder(exchangeHelper: any, order: any): Promise<any> {
  const orderParamValueArray = orderParamsEncode(order)
  const orderSigArray = orderSigEncode(order)
  let isValidate = exchangeHelper.methods.validateOrder(orderParamValueArray, orderSigArray).call()

  if (!isValidate) {
    throw new ElementError({ code: 1203 })
  }
  return isValidate
}

export function validateAndFormatWalletAddress(web3: any, address: string): string {
  if (!address) {
    throw new Error('No wallet address found')
  }
  if (!web3.utils.isAddress(address)) {
    throw new Error('Invalid wallet address')
  }
  if (address === NULL_ADDRESS) {
    throw new Error('Wallet cannot be the null address')
  }
  return address.toLowerCase()
}

let canSettleOrder = (listingTime: any, expirationTime: any) => {
  let now = new Date().getTime() / 1000
  if (BigNumber.isBigNumber(listingTime)) {
    listingTime = listingTime.toNumber()
  } else {
    listingTime = Number(listingTime)
  }

  if (BigNumber.isBigNumber(expirationTime)) {
    expirationTime = expirationTime.toNumber()
  } else {
    expirationTime = Number(expirationTime)
  }
  return listingTime < now && (expirationTime == 0 || now < expirationTime)
}

export function _ordersCanMatch(buy: Order, sell: Order) {
  return (
    buy.side == 0 &&
    sell.side == 1 &&
    /* Must use same fee method. */
    buy.feeMethod == sell.feeMethod &&
    /* Must use same payment token. */
    buy.paymentToken == sell.paymentToken &&
    /* Must match maker/taker addresses. */
    (sell.taker == NULL_ADDRESS || sell.taker == buy.maker) &&
    (buy.taker == NULL_ADDRESS || buy.taker == sell.maker) &&
    /* One must be maker and the other must be taker (no bool XOR in Solidity). */
    ((sell.feeRecipient == NULL_ADDRESS && buy.feeRecipient != NULL_ADDRESS) ||
      (sell.feeRecipient != NULL_ADDRESS && buy.feeRecipient == NULL_ADDRESS)) &&
    /* Must match target. */
    buy.target == sell.target &&
    /* Must match howToCall. */
    buy.howToCall == sell.howToCall &&
    /* Buy-side order must be settleable. */
    canSettleOrder(buy.listingTime, buy.expirationTime) &&
    /* Sell-side order must be settleable. */
    canSettleOrder(sell.listingTime, sell.expirationTime)
  )
}

export async function ordersCanMatch(exchangeHelper: any, buy: Order, sell: Order): Promise<any> {
  const buyOrderParamArray = orderParamsEncode(buy)
  const sellOrderParamArray = orderParamsEncode(sell)
  let canMatch = exchangeHelper.methods.ordersCanMatch(buyOrderParamArray, sellOrderParamArray).call()
  if (!canMatch) {
    throw new ElementError({ code: 1202 })
  }
  return true
}
