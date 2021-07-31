import { CallBack, ElementError, encodeCall, getSchemaList, NULL_ADDRESS, OrderCheckStatus } from '..'
import { BigNumber, MAX_UINT_256 } from './constants'
import { ExchangeMetadata } from '../types'
import { getElementAsset } from './makeOrder'

//1.  register
export async function registerProxy({
  proxyRegistryContract,
  account,
  callBack
}: {
  proxyRegistryContract: any
  account: string
  callBack?: CallBack
}): Promise<boolean> {
  let proxy = await proxyRegistryContract.methods.proxies(account).call()
  if (proxy === NULL_ADDRESS) {
    const res = await proxyRegistryContract.methods
      .registerProxy()
      .send({
        from: account
      })
      .on('transactionHash', (txHash: string) => {
        callBack?.next(OrderCheckStatus.RegisterTxHash, { txHash })
      })
      .on('receipt', (receipt: string) => {
        callBack?.next(OrderCheckStatus.EndRegister, { receipt })
      })
      .catch((error: any) => {
        if (error.code == '4001') {
          throw new ElementError(error)
        } else {
          throw new ElementError({ code: '2001', context: { funcName: 'registerProxy()' } })
        }
      })
  }
  return true
}

//2 approve pay token
export async function approveTokenTransferProxy({
  exchangeContract,
  erc20Contract,
  account,
  callBack
}: {
  exchangeContract: any
  erc20Contract: any
  account: string
  callBack?: CallBack
}): Promise<boolean> {
  let tokenTransferProxyAddr = await exchangeContract.methods.tokenTransferProxy().call()
  const allowAmount = await erc20Contract.methods.allowance(account, tokenTransferProxyAddr).call()
  if (new BigNumber(allowAmount).eq(0)) {
    let res = await erc20Contract.methods
      .approve(tokenTransferProxyAddr, MAX_UINT_256.toString())
      .send({
        from: account
      })
      .on('transactionHash', (txHash: string) => {
        callBack?.next(OrderCheckStatus.ApproveErc20TxHash, { txHash })
      })
      .on('receipt', (receipt: string) => {
        callBack?.next(OrderCheckStatus.EndApproveErc20, { receipt })
      })
      .catch((error: any) => {
        if (error.code == '4001') {
          throw error
        } else {
          throw new ElementError({ code: '2001', context: { funcName: 'Erc20 approveTokenTransferProxy()' } })
        }
      })
  }
  return true
}

//3  approve 1155 NFTs to proxy
export async function approveERC1155TransferProxy({
  proxyRegistryContract,
  erc1155Contract,
  account,
  callBack
}: {
  proxyRegistryContract: any
  erc1155Contract: any
  account: string
  callBack?: CallBack
}): Promise<boolean> {
  let operator = await proxyRegistryContract.methods.proxies(account).call()
  let isApprove = await erc1155Contract.methods.isApprovedForAll(account, operator).call()
  if (!isApprove) {
    let res = await erc1155Contract.methods
      .setApprovalForAll(operator, true)
      .send({ from: account })
      .on('transactionHash', (txHash: string) => {
        callBack?.next(OrderCheckStatus.ApproveErc1155TxHash, { txHash })
      })
      .on('receipt', (receipt: string) => {
        callBack?.next(OrderCheckStatus.EndApproveErc1155, { receipt })
      })
      .catch((error: any) => {
        if (error.code == '4001') {
          throw error
        } else {
          throw new ElementError({ code: '2001', context: { funcName: 'ERC1155 NFTs setApprovalForAll()' } })
        }
      })
  }
  return true
}

//4  approve 721 NFTs to proxy
export async function approveERC721TransferProxy({
  proxyRegistryContract,
  erc721Contract,
  account,
  tokenId,
  callBack
}: {
  proxyRegistryContract: any
  erc721Contract: any
  account: string
  tokenId: string
  callBack?: CallBack
}): Promise<boolean> {
  let operator = await proxyRegistryContract.methods.proxies(account).call()
  //isApprovedForAll
  let isApprove = await erc721Contract.methods.isApprovedForAll(account, operator).call()
  if (!isApprove) {
    //  function setApprovalForAll(address _operator, bool _approved) external;
    // let res = await nftsContract.methods.approve(operator, tokenId).send({ from: account })
    let res = await erc721Contract.methods
      .setApprovalForAll(operator, true)
      .send({ from: account })
      .on('transactionHash', (txHash: string) => {
        callBack?.next(OrderCheckStatus.ApproveErc721TxHash, { txHash })
      })
      .on('receipt', (receipt: string) => {
        callBack?.next(OrderCheckStatus.EndApproveErc721, { receipt })
      })
      .catch((error: any) => {
        if (error.code == '4001') {
          throw error
        } else {
          throw new ElementError({ code: '2001', context: { funcName: 'ERC721 NFTs setApprovalForAll()' } })
        }
      })
  }
  return true
}

export async function approveSchemaProxy({
  contract,
  orderMetadata,
  callBack
}: {
  contract: any
  orderMetadata: ExchangeMetadata
  callBack?: CallBack
}): Promise<boolean> {
  const account = contract.web3.eth.defaultAccount
  const operator = await contract.exchangeProxyRegistry.methods.proxies(account).call()

  const schemas = getSchemaList(contract.networkName, orderMetadata.schema)
  const schema = schemas[0]
  const asset = {
    tokenId: orderMetadata.asset.id,
    tokenAddress: orderMetadata.asset.address,
    schemaName: orderMetadata.schema
  }
  const elementAsset = getElementAsset(schema, asset)
  //ElementSchemaName.CryptoKitties:
  // @ts-ignore
  const accountApprove = schema?.functions?.approve(elementAsset, operator)
  const callData = encodeCall(accountApprove, [operator, asset.tokenId])
  // const txCount = await contract.web3.eth.getTransactionCount(account)
  // nonce: txCount,
  console.log(schema.address, callData)
  const estimateGas = await contract.web3.eth.estimateGas({ to: schema.address, data: callData })
  const transactionObject = {
    from: account,
    to: asset.tokenAddress,
    value: 0,
    gas: estimateGas,
    data: callData
  }

  // {
  //     "from": "0xea199722372dea9df458dbb56be7721af117a9bc",
  //     "to": "0x1530272ce6e4589f5c09151a7c9a118a58d70e09",
  //     "data": "0x095ea7b3000000000000000000000000122427995b89f44f7ac20b765fb7b5578c7313980000000000000000000000000000000000000000000000000000000000000001",
  //     "value": "0x0",
  //     "gas": "0xc518",
  //     "gasPrice": "0x3b9aca08"
  // }
  await contract.web3.eth
    .sendTransaction(transactionObject)
    .on('transactionHash', (txHash: string) => {
      console.log(txHash)
      callBack?.next(OrderCheckStatus.ApproveErc721TxHash, { txHash })
    })
    .on('receipt', (receipt: string) => {
      console.log(receipt)
      callBack?.next(OrderCheckStatus.EndApproveErc721, { receipt })
    })
    .catch((error: any) => {
      if (error.code == '4001') {
        throw error
      } else {
        throw new ElementError({ code: '2001', context: { funcName: `${schema.name} setApprovalForAll()` } })
      }
    })

  return true
}
