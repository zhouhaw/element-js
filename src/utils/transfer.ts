import { NULL_ADDRESS } from './constants'

import { toBaseUnitAmount, makeBigNumber, getSchemaList } from './helper'
import { Asset, CallBack, ElementError, encodeCall, OrderCheckStatus } from '../index'

function transferFailure(error: any) {
  const error_ =
    error.code === '4001'
      ? new ElementError(error)
      : new ElementError({ code: '1000', message: 'Transfer Asset failure' })
  throw error_
}

export async function transferFromERC1155(
  {
    erc1155Contract,
    from,
    to,
    tokenId,
    amount
  }: {
    erc1155Contract: any
    from: string
    to: string
    tokenId: any
    amount: number
  },
  callBack?: CallBack
): Promise<any> {
  return erc1155Contract.methods
    .safeTransferFrom(from, to, tokenId, amount, '0x')
    .send({ from: from })
    .on('transactionHash', (txHash: string) => {
      // console.log('Send success tx hash：', txHash)
      const assetAddress = erc1155Contract.options.address
      callBack?.next(OrderCheckStatus.TransferErc1155, { txHash, from, to, tokenId, amount, assetAddress })
    })
    .catch((error: any) => {
      transferFailure(error)
    })
}

export async function transferFromERC721(
  {
    erc721Contract,
    from,
    to,
    tokenId,
    amount
  }: {
    erc721Contract: any
    from: string
    to: string
    tokenId: any
    amount: number
  },
  callBack?: CallBack
): Promise<any> {
  return erc721Contract.methods
    .safeTransferFrom(from, to, tokenId)
    .send({ from: from })
    .on('transactionHash', (txHash: string) => {
      const assetAddress = erc721Contract.options.address
      callBack?.next(OrderCheckStatus.TransferErc721, { txHash, from, to, tokenId, assetAddress })
      console.log('Send success tx hash：', txHash)
    })
}


export async function transferFromSchema(
  {
    contract,
    asset,
    from,
    to,
    amount
  }: {
    contract: any
    asset: Asset
    from: string,
    to: string
    amount: number
  }, callBack?: CallBack): Promise<boolean> {

  const schemas = getSchemaList(contract.networkName, asset.schemaName)
  const schema = schemas[0]
  const elementAsset = schema.assetFromFields({ ID: asset.tokenId, Address: asset.tokenAddress })
  // @ts-ignore
  const transferFunc = schema?.functions?.ownerTransfer(elementAsset,to)

  // 生成 Calldata
  const callData = encodeCall(transferFunc, [to, asset.tokenId])
  // const txCount = await contract.web3.eth.getTransactionCount(account)
  // nonce: txCount,
  const estimateGas = await contract.web3.eth.estimateGas({ to: schema.address, data: callData })
  const transactionObject = {
    from,
    to: asset.tokenAddress,
    value: 0,
    gas: estimateGas,
    data: callData
  }

  await contract.web3.eth
    .sendTransaction(transactionObject)
    .on('transactionHash', (txHash: string) => {
      console.log(txHash)
      callBack?.next(OrderCheckStatus.TransferErc721, { txHash })
    })
    .catch((error: any) => {
      if (error.code == '4001') {
        throw error
      } else {
        throw new ElementError({ code: '2001', context: { funcName: `${schema.name} transferFromSchema()` } })
      }
    })

  return true
}


export async function transferFromERC20(
  {
    erc20Contract,
    from,
    to,
    tokenId,
    amount
  }: {
    erc20Contract: any
    from: string
    to: string
    tokenId: any
    amount: number
  },
  callBack?: CallBack
): Promise<any> {
  return erc20Contract.methods.safeTransferFrom(from, to, tokenId, amount, '0x').send({ from: from })
}

export async function transferFromWETH(
  {
    WETHContract,
    from,
    to,
    tokenId,
    amount
  }: {
    WETHContract: any
    from: string
    to: string
    tokenId: any
    amount: number
  },
  callBack?: CallBack
) {
  let sellBal = await WETHContract.methods.balanceOf(from).call()
  if (Number(sellBal) < 1e18) {
    await WETHContract.methods.deposit().send({
      from: from,
      value: toBaseUnitAmount(makeBigNumber(amount), 18)
    })
    sellBal = await WETHContract.methods.balanceOf(from).call()
  }
  return sellBal
}

/**
 * Validates that an address exists, isn't null, and is properly
 * formatted for Wyvern and OpenSea
 * @param address input address
 */
export function validateAndFormatWalletAddress(web3: any, address: string): string {
  if (!address) {
    throw new Error('No wallet address found')
  }
  if (!web3.utils.isAddress(address)) {
    throw new Error('Invalid wallet address')
  }
  if (address == NULL_ADDRESS) {
    throw new Error('Wallet cannot be the null address')
  }
  return address.toLowerCase()
}
