import {
  NULL_ADDRESS,
  MAX_UINT_256,
  makeBigNumber,
  ordersCanMatch,
  getSchemaList,
  encodeSell,
  validateOrder
} from './index'
import { Asset, ElementSchemaName, Network, Order } from '../types'

export async function checkSenderOfAuthenticatedProxy(
  exchangeContract: any,
  authenticatedProxyContract: any,
  proxyRegistryContract: any,
  account: string
): Promise<boolean> {
  let proxy = await proxyRegistryContract.methods.proxies(account).call()
  let authProxyContract = authenticatedProxyContract.clone()
  authProxyContract.options.address = proxy

  let user = await authProxyContract.methods.user().call()
  if (user != account) {
    return false
  }

  let authproxyRegistryAddr = await authProxyContract.methods.registry().call()
  let exchangeProxyRegistryAddr = await exchangeContract.methods.registry().call()

  if (authproxyRegistryAddr != exchangeProxyRegistryAddr) {
    return false
  }

  if (authproxyRegistryAddr != proxyRegistryContract.options.address) {
    return false
  }

  // 验证是否注册
  return proxyRegistryContract.methods.contracts(exchangeContract.options.address).call()
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
  let proxy = proxyRegistryContract.methods.proxies(account).call()
  if (proxy === NULL_ADDRESS) {
    return false
  } else {
    return true
  }
}

//1. check register
export async function registerProxy(proxyRegistryContract: any, account: string): Promise<boolean> {
  let isRegister = await checkRegisterProxy(proxyRegistryContract, account)
  if (!isRegister) {
    let res = await proxyRegistryContract.methods.registerProxy().send({
      from: account
    })
    return res.status
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
  const amount = await erc20Contract.methods.balanceOf(account).call()
  const allowAmount = await erc20Contract.methods.allowance(account, tokenTransferProxyAddr).call()
  if (Number(allowAmount) == 0) {
    console.log('checkApproveTokenTransferProxy allowAmount %s amount', allowAmount, amount)
    return false
  }
  return true
}

//2 approve pay token
export async function approveTokenTransferProxy(
  exchangeContract: any,
  erc20Contract: any,
  account: string
): Promise<boolean> {
  let isApprove = await checkApproveTokenTransferProxy(exchangeContract, erc20Contract, account)
  if (!isApprove) {
    let tokenTransferProxyAddr = await exchangeContract.methods.tokenTransferProxy().call()
    let approveResult = await erc20Contract.methods.approve(tokenTransferProxyAddr, MAX_UINT_256).send({
      from: account
    })
    return approveResult.status
  }
  return true
}

export async function checkApproveERC1155TransferProxy(
  proxyRegistryContract: any,
  nftsContract: any,
  account: string
): Promise<boolean> {
  let operator = await proxyRegistryContract.methods.proxies(account).call()
  return nftsContract.methods.isApprovedForAll(account, operator).call()
}

//3  approve 1155 NFTs to proxy
export async function approveERC1155TransferProxy(
  proxyRegistryContract: any,
  nftsContract: any,
  account: string
): Promise<boolean> {
  let isApprove = await checkApproveERC1155TransferProxy(proxyRegistryContract, nftsContract, account)
  if (!isApprove) {
    let operator = await proxyRegistryContract.methods.proxies(account).call()
    let res = await nftsContract.methods.setApprovalForAll(operator, true).send({ from: account })
    return res.status
  }
  return isApprove
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
    return res.status
  }
  return isApprove
}

export async function checkSellUser(contract: any, asset: Asset, paymentTokenAddr: string, accountAddress: string) {
  if (paymentTokenAddr == '') {
    paymentTokenAddr = NULL_ADDRESS
  }
  const sellNFTs = contract.erc1155.clone()
  sellNFTs.options.address = asset.tokenAddress
  let bal = await getAccountNFTsBalance(sellNFTs, accountAddress, asset.tokenId)
  if (bal == 0) {
    console.log('createSellOrder :elementSharedAsset balanceOf equal 0 !')
    return false
  }

  let isRegister = await registerProxy(contract.exchangeProxyRegistry, accountAddress)

  if (!isRegister) {
    console.log('createSellOrder:isRegister false')
    return false
  }

  if (asset.schemaName == ElementSchemaName.ERC1155) {
    let isApproveAssetTransfer = await approveERC1155TransferProxy(
      contract.exchangeProxyRegistry,
      sellNFTs,
      accountAddress
    )
    if (!isApproveAssetTransfer) {
      console.log('createSellOrder:isApproveAssetTransfer ')
      return false
    }
  }

  if (paymentTokenAddr != NULL_ADDRESS) {
    let erc20Contract = contract.erc20.clone()
    erc20Contract.options.address = paymentTokenAddr
    let isApproveTokenTransfer = await approveTokenTransferProxy(contract.exchange, erc20Contract, accountAddress)
    if (!isApproveTokenTransfer) {
      console.log('checkBuyUser:isApproveTokenTransfer ')
      return false
    }
  }

  return true
}

export async function checkBuyUser(contract: any, paymentTokenAddr: any, accountAddress: string) {
  // exchangeProxyRegistry
  let isRegister = await registerProxy(contract.exchangeProxyRegistry, accountAddress)

  if (!isRegister) {
    console.log('checkBuyUser isRegister false')
    return false
  }

  let isApproveWETH = await approveTokenTransferProxy(contract.exchange, contract.WETH, accountAddress)

  if (!isApproveWETH) {
    console.log('checkBuyUser isApproveWETH false')
    return false
  }

  if (paymentTokenAddr != NULL_ADDRESS) {
    let erc20Contract = contract.erc20.clone()
    erc20Contract.options.address = paymentTokenAddr
    let { erc20Bal } = await getAccountBalance(contract.web3, accountAddress, erc20Contract)
    if (erc20Bal == 0) {
      console.log('checkBuyUser:erc20Bal balance equal 0')
      return false
    }
    let isApproveTokenTransfer = await approveTokenTransferProxy(contract.exchange, erc20Contract, accountAddress)
    if (!isApproveTokenTransfer) {
      console.log('checkBuyUser:isApproveTokenTransfer ')
      return false
    }
  }
  return true
}

export async function checkMatchOrder(contract: any, buy: Order, sell: Order, accountAddress: string) {
  if (!buy.hash && !sell.hash) {
    console.log('buy.hash %s sell.hash %s', buy.hash, sell.hash)
    return false
  }
  let sellRegister = await checkRegisterProxy(contract.exchangeProxyRegistry, sell.maker)

  if (!sellRegister) {
    console.log('checkMatchOrder: sellRegister false')
    return false
  }

  let buyRegister = await checkRegisterProxy(contract.exchangeProxyRegistry, buy.maker)

  if (!buyRegister) {
    console.log('checkMatchOrder: buyRegister false')
    return false
  }

  const equalPrice: boolean = buy.basePrice.eq(sell.basePrice)
  // const equalPrice: boolean = buy.basePrice == sell.basePrice
  if (!equalPrice) {
    console.log('checkMatchOrder:buy.basePrice and sell.basePrice not equal!')
    return false
  }

  const sellNFTs = contract.erc1155.clone()
  sellNFTs.options.address = sell.metadata.asset.address
  let bal = await getAccountNFTsBalance(sellNFTs, sell.maker, sell.metadata.asset.id)

  // let bal = await getAccountNFTsBalance(this.elementSharedAsset, sell.maker, sell.metadata.asset.id)
  if (bal == 0) {
    console.log('checkMatchOrder:elementSharedAsset balanceOf equal 0 !')
    return false
  }

  let { ethBal } = await getAccountBalance(contract.web3, accountAddress)
  if (ethBal == 0) {
    console.log('checkMatchOrder:ETH balance equal 0')
    return false
  }

  if (buy.paymentToken != NULL_ADDRESS) {
    let erc20Contract = contract.erc20.clone()
    erc20Contract.options.address = buy.paymentToken
    let { erc20Bal } = await getAccountBalance(contract.web3, buy.maker, erc20Contract)

    if (!makeBigNumber(erc20Bal).gt(buy.basePrice)) {
      console.log('checkMatchOrder:erc20Bal balance', buy.basePrice.toNumber(), erc20Bal)
      return false
    }
    let isApproveTokenTransfer = await checkApproveTokenTransferProxy(contract.exchange, erc20Contract, buy.maker)
    if (!isApproveTokenTransfer) {
      console.log('checkMatchOrder:isApproveTokenTransfer ')
      return false
    }
  }

  if (sell.paymentToken != NULL_ADDRESS) {
    let erc20Contract = contract.erc20.clone()
    erc20Contract.options.address = sell.paymentToken
    let isApproveTokenTransfer = await checkApproveTokenTransferProxy(contract.exchange, erc20Contract, sell.maker)
    if (!isApproveTokenTransfer) {
      console.log('checkMatchOrder:isApproveTokenTransfer ')
      return false
    }
  }

  if (sell.metadata.schema == ElementSchemaName.ERC1155) {
    let isApproveAssetTransfer = await checkApproveERC1155TransferProxy(
      contract.exchangeProxyRegistry,
      sellNFTs,
      sell.maker
    )
    if (!isApproveAssetTransfer) {
      console.log('checkMatchOrder:isApproveAssetTransfer ')
      return false
    }
  }

  // let canMatch = await ordersCanMatch(buy, sell)
  let canMatch = await ordersCanMatch(contract.exchangeHelper, buy, sell)
  if (!canMatch) {
    console.log('checkMatchOrder: canMatch false')
    return false
  }

  // encodeSell
  let schemas = getSchemaList(Network.Private, sell.metadata.schema)
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

  const buyIsValid: boolean = await validateOrder(contract.exchangeHelper, buy)
  const sellIsValid: boolean = await validateOrder(contract.exchangeHelper, sell)
  if (!sellIsValid && !buyIsValid) {
    console.log('matchOrder: validateOrder false')
    return false
  }
  return true
}
