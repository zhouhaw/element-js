import { encodeBuy, encodeSell } from '../schema'
import { BigNumber, NULL_ADDRESS } from './constants'
import {
  Asset,
  ECSignature,
  ElementSchemaName,
  ExchangeMetadata,
  Network,
  Order,
  OrderSide,
  UnhashedOrder
} from '../types'
import { ElementError } from '../base/error'

import { getAccountBalance, getSchemaList, makeBigNumber, orderParamsEncode, orderSigEncode } from './helper'
import { CallSpec } from '../schema/schemaFunctions'

const log = console.log

// 检查交易合约，用户授权合约，代理合约 是否授权正确
export async function checkSenderOfAuthenticatedProxy(
  exchangeContract: any,
  authenticatedProxyContract: any,
  proxyRegistryContract: any,
  account: string
): Promise<boolean> {
  let proxy = await proxyRegistryContract.methods.proxies(account).call()
  if (proxy == NULL_ADDRESS) {
    throw new ElementError({ code: '1001' })
  }
  let authProxyContract = authenticatedProxyContract.clone()
  authProxyContract.options.address = proxy

  let user = await authProxyContract.methods.user().call()
  if (user.toLowerCase() != account) {
    throw new ElementError({ code: '1001' })
  }
  // 查询用户授权的 proxy 执行合约地址
  let authproxyRegistryAddr = await authProxyContract.methods.registry().call()
  // 交易合约授权的 orderMatch 执行合约地址
  let exchangeProxyRegistryAddr = await exchangeContract.methods.registry().call()

  // 用户代理合约授权合约 和 和交易代理授权合约是否一致
  if (authproxyRegistryAddr.toLowerCase() != exchangeProxyRegistryAddr.toLowerCase()) {
    throw new ElementError({ code: '1002' })
  }

  // 用户交易的代理注册合约 和 代理注册合约是否一致
  if (authproxyRegistryAddr.toLowerCase() != proxyRegistryContract.options.address.toLowerCase()) {
    throw new ElementError({ code: '1002' })
  }

  // 验证交易合约是否为代理执行的合约地址
  let isPass = await proxyRegistryContract.methods.contracts(exchangeContract.options.address).call()

  if (!isPass) {
    throw new ElementError({ code: '1002' })
  }
  return true
}

//1. check register
export async function checkRegisterProxy(proxyRegistryContract: any, account: string): Promise<boolean> {
  let proxy = await proxyRegistryContract.methods.proxies(account).call()
  if (proxy === NULL_ADDRESS) {
    throw new ElementError({ code: '1001' })
  }
  return true
}

//2 check approve pay token
export async function checkApproveTokenTransferProxy(
  exchangeContract: any,
  erc20Contract: any,
  account: string
): Promise<boolean> {
  let tokenTransferProxyAddr = await exchangeContract.methods.tokenTransferProxy().call()
  const allowAmount = await erc20Contract.methods.allowance(account, tokenTransferProxyAddr).call()

  if (new BigNumber(allowAmount).eq(0)) {
    throw new ElementError({ code: '1101', data: { erc20Address: erc20Contract.options.address } })
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
    throw new ElementError({ code: '1102', data: { nftAddress: nftsContract.options.address } })
  }
  return isApprove
}

export async function checkApproveERC721TransferProxy(
  proxyRegistryContract: any,
  nftsContract: any,
  account: string,
  tokenID: string
): Promise<boolean> {
  let operator = await proxyRegistryContract.methods.proxies(account).call()
  let isApprove = await nftsContract.methods.isApprovedForAll(account, operator).call()
  if (!isApprove) {
    throw new ElementError({ code: '1106', data: { nftAddress: nftsContract.options.address, tokenId: tokenID } })
  }
  return true
}

export async function checkUnhashedOrder(contract: any, order: UnhashedOrder) {
  const equalPrice: boolean = order.basePrice.gt(0)
  if (!equalPrice) throw new ElementError({ code: '1201', data: { order } })

  try {
    const erc20Contract = contract.erc20.clone()
    let metadata = order.metadata
    // 检查 Sell 买单
    if (order.side == OrderSide.Sell) {
      let sell = order

      await checkRegisterProxy(contract.exchangeProxyRegistry, order.maker)
      await checkAssetApprove(contract, sell)
      await checkAssetBalance(contract, sell)
      //transfer fee
      if (sell.paymentToken != NULL_ADDRESS) {
        erc20Contract.options.address = sell.paymentToken
        await checkApproveTokenTransferProxy(contract.exchange, erc20Contract, sell.maker)
      }
    }
    // 检查 Buy 卖单
    if (order.side == OrderSide.Buy) {
      let buy = order

      const { assetAddress } = getAssetInfo(metadata)
      if (assetAddress != contract.elementSharedAssetAddr) {
        await checkAssetMint(contract, metadata)
      }
      if (buy.paymentToken !== NULL_ADDRESS) {
        erc20Contract.options.address = buy.paymentToken
        let { erc20Bal } = await getAccountBalance(contract.web3, buy.maker, erc20Contract)
        if (makeBigNumber(erc20Bal).lt(buy.basePrice))
          throw new ElementError({ code: '1103', context: { assetType: 'ERC20' } })

        await checkApproveTokenTransferProxy(contract.exchange, erc20Contract, buy.maker)
      } else {
        // if (accountAddress != buy.maker.toLowerCase()) throw new ElementError({ code: '1204' })
        let { ethBal } = await getAccountBalance(contract.web3, buy.maker)
        if (makeBigNumber(ethBal).lt(buy.basePrice))
          throw new ElementError({ code: '1103', context: { assetType: 'ETH' } })
      }
    }
    checkDataToCall(contract.networkName, order)
  } catch (error) {
    if (error.data) {
      error.data.order = order
    } else {
      error = { ...error, message: error.message, data: { order } }
    }
    throw error
  }
  return true
}

// 检查签名订单是否正确
export async function checkOrder(contract: any, order: Order) {
  // 简单订单授权，资产余额
  await checkUnhashedOrder(contract, order)
  // 检查订单是否被取消
  await checkOrderCancelledOrFinalized(contract, order)
  // 主要是检查Hash是否正确
  await validateOrder(contract.exchangeHelper, order)

  return true
}

export async function checkMatchOrder(contract: any, buy: Order, sell: Order) {
  const equalPrice: boolean = sell.basePrice.gte(buy.basePrice)
  if (!equalPrice) {
    throw new ElementError({ code: '1201' })
  }
  // 检查对手单是否满足撮合条件
  if (!_ordersCanMatch(buy, sell)) {
    throw new ElementError({ code: '1202' })
  }

  if (sell.feeRecipient != NULL_ADDRESS) {
    /* Assert taker fee is less than or equal to maximum fee specified by buyer. */
    if (!sell.takerRelayerFee.lte(buy.takerRelayerFee)) {
      throw new ElementError({
        code: '1000',
        message: `sell.takerRelayerFee ${sell.takerRelayerFee} <= buy.takerRelayerFee ${buy.takerRelayerFee}`
      })
    }
    await checkOrder(contract, sell)
  } else {
    /* Assert taker fee is less than or equal to maximum fee specified by seller. */
    if (!buy.takerRelayerFee.lte(sell.takerRelayerFee)) {
      throw new ElementError({
        code: '1000',
        message: `buy.takerRelayerFee ${buy.takerRelayerFee} <= sell.takerRelayerFee ${sell.takerRelayerFee}`
      })
    }
    await checkUnhashedOrder(contract, sell) // 检查 sell fee 是否授权
    await checkOrder(contract, buy)
  }

  return true
}

export function checkDataToCall(netWorkName: Network, order: UnhashedOrder) {
  let schemas = getSchemaList(netWorkName, order.metadata.schema)
  // TODO data sell.metadata.asset
  let asset: any = order.metadata.asset
  if (!asset.data && asset.schemaName === ElementSchemaName.ERC1155) {
    asset = { ...asset, data: '' }
  }
  let encodeData: CallSpec
  if (order.side == OrderSide.Sell) {
    encodeData = encodeSell(schemas[0], asset, order.maker)
  } else {
    encodeData = encodeBuy(schemas[0], asset, order.maker)
  }

  if (encodeData.dataToCall != order.dataToCall) {
    log('checkDataToCall.dataToCall error')
    throw new ElementError({ code: '1208' })
  }

  if (encodeData.target != order.target) {
    log('checkDataToCall.target error')
    throw new ElementError({ code: '1209' })
  }

  if (encodeData.replacementPattern != order.replacementPattern) {
    throw new ElementError({ code: '1210' })
  }
}

export async function validateOrder(exchangeHelper: any, order: Order): Promise<any> {
  const orderParamValueArray = orderParamsEncode(order as UnhashedOrder)
  const orderSigArray = orderSigEncode(order as ECSignature)
  try {
    let isValidate = await exchangeHelper.methods.validateOrder(orderParamValueArray, orderSigArray).call()
    if (!isValidate) {
      log('validateOrder', orderParamValueArray)
      throw new ElementError({ code: '1203' })
    }
    return isValidate
  } catch (e) {
    if (!e.code) {
      throw new ElementError({ code: '1205' })
    }
    throw e
  }
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
  let now = Math.round(Date.now() / 1000)

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
  const canSettle = listingTime <= now && (expirationTime == 0 || now < expirationTime)
  //  log(`canSettleOrder ${canSettle} ${listingTime} <  now: ${now} < ${expirationTime} `)
  return canSettle
}

export function _ordersCanMatch(buy: Order, sell: Order) {
  const errorLog = (msg: string): boolean => {
    log('_ordersCanMatch false ', msg)
    return false
  }
  return (
    (buy.side == 0 || errorLog('buy.side')) &&
    (sell.side == 1 || errorLog('sell.side')) &&
    /* Must use same fee method. */
    (buy.feeMethod == sell.feeMethod || errorLog('feeMethod !=')) &&
    /* Must use same payment token. */
    (buy.paymentToken == sell.paymentToken || errorLog('paymentToken !=')) &&
    /* Must match maker/taker addresses. */
    (sell.taker == NULL_ADDRESS || sell.taker == buy.maker || errorLog('sell.taker != buy.maker')) &&
    (buy.taker == NULL_ADDRESS || buy.taker == sell.maker || errorLog('buy.taker != sell.maker')) &&
    /* One must be maker and the other must be taker (no bool XOR in Solidity). */
    ((sell.feeRecipient == NULL_ADDRESS && buy.feeRecipient != NULL_ADDRESS) ||
      (sell.feeRecipient != NULL_ADDRESS && buy.feeRecipient == NULL_ADDRESS)) &&
    /* Must match target. */
    (buy.target == sell.target || errorLog('target != ')) &&
    /* Must match howToCall. */
    (buy.howToCall == sell.howToCall || errorLog('howToCall != ')) &&
    /* Buy-side order must be settleable. */
    (canSettleOrder(buy.listingTime, buy.expirationTime) || errorLog(`buy.expirationTime != `)) &&
    /* Sell-side order must be settleable. */
    (canSettleOrder(sell.listingTime, sell.expirationTime) || errorLog(`sell.expirationTime != `))
  )
}

export async function ordersCanMatch(exchangeHelper: any, buy: Order, sell: Order): Promise<any> {
  const buyOrderParamArray = orderParamsEncode(buy)
  const sellOrderParamArray = orderParamsEncode(sell)
  let canMatch = exchangeHelper.methods.ordersCanMatch(buyOrderParamArray, sellOrderParamArray).call()
  if (!canMatch) {
    throw new ElementError({ code: '1202' })
  }
  return true
}

// 是否取消或者完成
export async function checkOrderCancelledOrFinalized(contract: any, order: Order) {
  const orderParamValueArray = orderParamsEncode(order as UnhashedOrder)
  const hash = await contract.exchangeHelper.methods.hashToSign(orderParamValueArray).call()
  const iscancelledOrFinalized = await contract.exchange.methods.cancelledOrFinalized(hash).call()

  if (iscancelledOrFinalized) {
    if (order.side === OrderSide.Sell) {
      throw new ElementError({ code: '1207', context: { orderSide: 'Sell' } })
    } else {
      throw new ElementError({ code: '1207', context: { orderSide: 'Buy' } })
    }
  }
}

function getAssetInfo(metadata: ExchangeMetadata) {
  let tokenId: any
  let assetAddress: string
  if (metadata.asset.id && metadata.asset.address) {
    tokenId = metadata.asset.id
    assetAddress = metadata.asset.address.toLowerCase()
  } else {
    throw new ElementError({
      message: 'sell.metadata.asset.id or address undefined',
      code: '1000'
    })
  }
  return { tokenId, assetAddress }
}

export async function checkAssetMint(contract: any, metadata: ExchangeMetadata) {
  const { tokenId, assetAddress } = getAssetInfo(metadata)

  if (assetAddress == contract.elementSharedAssetV1?.options.address.toLowerCase()) {
    // 如对应token id 的资产未创建 未false
    let exists = await contract.elementSharedAssetV1?.methods.exists(tokenId).call()
    if (!exists) {
      throw new ElementError({
        message: 'elementSharedAssetV1 asset not exists',
        code: '1000'
      })
    }
  }
  return true
}

export async function checkAssetApprove(contract: any, order: UnhashedOrder) {
  let sell = order
  let checkAddr = sell.maker
  let metadata = sell.metadata
  const { tokenId, assetAddress } = getAssetInfo(metadata)

  let sellNFTs = contract.erc20.clone()

  switch (metadata.schema) {
    case ElementSchemaName.ERC20:
      sellNFTs = contract.erc20.clone()
      sellNFTs.options.address = assetAddress
      break
    case ElementSchemaName.ERC721:
      sellNFTs = contract.erc721.clone()
      sellNFTs.options.address = assetAddress
      await checkApproveERC721TransferProxy(contract.exchangeProxyRegistry, sellNFTs, checkAddr, tokenId)
      break
    case ElementSchemaName.ERC1155:
      sellNFTs = contract.erc1155.clone()
      sellNFTs.options.address = assetAddress
      if (assetAddress != contract.elementSharedAssetAddr) {
        await checkAssetMint(contract, metadata)
      }
      await checkApproveERC1155TransferProxy(contract.exchangeProxyRegistry, sellNFTs, checkAddr)
      break
    default:
      throw new ElementError({ code: '1206', context: { assetType: metadata.schema } })
      break
  }
  return sellNFTs
}

export async function checkAssetBalance(contract: any, order: UnhashedOrder) {
  let sell = order
  let checkAddr = sell.maker.toLowerCase()
  let metadata = sell.metadata
  const { tokenId, assetAddress } = getAssetInfo(metadata)

  let sellNFTs = contract.erc20.clone()
  let balance = 0

  switch (metadata.schema) {
    case ElementSchemaName.ERC20:
      sellNFTs = contract.erc20.clone()
      sellNFTs.options.address = assetAddress
      break
    case ElementSchemaName.ERC721:
      sellNFTs = contract.erc721.clone()
      sellNFTs.options.address = assetAddress
      let owner = await sellNFTs.methods.ownerOf(tokenId).call()
      if (owner.toLowerCase() !== checkAddr)
        throw new ElementError({ code: '1103', context: { assetType: metadata.schema } })
      balance = 1
      break
    case ElementSchemaName.ERC1155:
      sellNFTs = contract.erc1155.clone()
      sellNFTs.options.address = assetAddress
      balance = await sellNFTs.methods.balanceOf(checkAddr, tokenId).call()
      break
    default:
      throw new ElementError({ code: '1206', context: { assetType: metadata.schema } })
      break
  }

  if (sell.quantity.gt(balance.toString())) {
    throw new ElementError({ code: '1103', context: { assetType: metadata.schema } })
  }

  return Number(balance)
}
