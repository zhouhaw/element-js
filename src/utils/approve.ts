import { CallBack, ElementError, NULL_ADDRESS, OrderCheckStatus } from '..'
import { BigNumber, MAX_UINT_256 } from './constants'

//1.  register
export async function registerProxy(
  { proxyRegistryContract, account, callBack }
    : { proxyRegistryContract: any, account: string, callBack?: CallBack }
): Promise<boolean> {
  let proxy = await proxyRegistryContract.methods.proxies(account).call()
  if (proxy === NULL_ADDRESS) {
    const res = await proxyRegistryContract.methods.registerProxy()
      .send({
        from: account
      }).on('transactionHash', (txHash: string) => {
        callBack?.next(OrderCheckStatus.RegisterTxHash, { txHash })
      }).on('receipt', (receipt: string) => {
        callBack?.next(OrderCheckStatus.EndRegister, { receipt })
      }).catch((error: any) => {
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
export async function approveTokenTransferProxy(
  { exchangeContract, erc20Contract, account, callBack }
    : { exchangeContract: any, erc20Contract: any, account: string, callBack?: CallBack }
): Promise<boolean> {
  let tokenTransferProxyAddr = await exchangeContract.methods.tokenTransferProxy().call()
  const allowAmount = await erc20Contract.methods.allowance(account, tokenTransferProxyAddr).call()
  if (new BigNumber(allowAmount).eq(0)) {
    let res = await erc20Contract.methods.approve(tokenTransferProxyAddr, MAX_UINT_256.toString())
      .send({
        from: account
      }).on('transactionHash', (txHash: string) => {
        callBack?.next(OrderCheckStatus.ApproveErc20TxHash, { txHash })
      }).on('receipt', (receipt: string) => {
        callBack?.next(OrderCheckStatus.EndApproveErc20, { receipt })
      }).catch((error: any) => {
        if (error.code == '4001') {
          throw  error
        } else {
          throw new ElementError({ code: '2001', context: { funcName: 'Erc20 approveTokenTransferProxy()' } })
        }
      })
  }
  return true
}

//3  approve 1155 NFTs to proxy
export async function approveERC1155TransferProxy(
  { proxyRegistryContract, erc1155Contract, account, callBack }
    : { proxyRegistryContract: any, erc1155Contract: any, account: string, callBack?: CallBack }
): Promise<boolean> {
  let operator = await proxyRegistryContract.methods.proxies(account).call()
  let isApprove = await erc1155Contract.methods.isApprovedForAll(account, operator).call()
  if (!isApprove) {
    let res = await erc1155Contract.methods.setApprovalForAll(operator, true)
      .send({ from: account })
      .on('transactionHash', (txHash: string) => {
        callBack?.next(OrderCheckStatus.ApproveErc1155TxHash, { txHash })
      }).on('receipt', (receipt: string) => {
        callBack?.next(OrderCheckStatus.EndApproveErc1155, { receipt })
      }).catch((error: any) => {
        if (error.code == '4001') {
          throw  error
        } else {
          throw new ElementError({ code: '2001', context: { funcName: 'ERC1155 NFTs setApprovalForAll()' } })
        }
      })
  }
  return true
}

//4  approve 721 NFTs to proxy
export async function approveERC721TransferProxy(
  { proxyRegistryContract, erc721Contract, account, tokenId, callBack }
    : { proxyRegistryContract: any, erc721Contract: any, account: string, tokenId: string, callBack?: CallBack }
): Promise<boolean> {
  let operator = await proxyRegistryContract.methods.proxies(account).call()
  //isApprovedForAll
  let isApprove = await erc721Contract.methods.isApprovedForAll(account, operator).call()
  if (!isApprove) {
    //  function setApprovalForAll(address _operator, bool _approved) external;
    // let res = await nftsContract.methods.approve(operator, tokenId).send({ from: account })
    let res = await erc721Contract.methods.setApprovalForAll(operator, true)
      .send({ from: account })
      .on('transactionHash', (txHash: string) => {
        callBack?.next(OrderCheckStatus.ApproveErc721TxHash, { txHash })
      }).on('receipt', (receipt: string) => {
        callBack?.next(OrderCheckStatus.EndApproveErc721, { receipt })
      }).catch((error: any) => {
        if (error.code == '4001') {
          throw  error
        } else {
          throw new ElementError({ code: '2001', context: { funcName: 'ERC721 NFTs setApprovalForAll()' } })
        }
      })
  }
  return true
}
