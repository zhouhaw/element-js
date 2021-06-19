import { ElementError, NULL_ADDRESS } from '..'
import { BigNumber, MAX_UINT_256 } from './constants'

//1.  register
export async function registerProxy(proxyRegistryContract: any, account: string): Promise<boolean> {
  let proxy = await proxyRegistryContract.methods.proxies(account).call()
  if (proxy === NULL_ADDRESS) {
    let res = await proxyRegistryContract.methods.registerProxy().send({
      from: account
    })
    if (!res.status) {
      throw new ElementError({ code: '2001', message: 'registerProxy()' })
    }
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
  if (new BigNumber(allowAmount).eq(0)) {
    let res = await erc20Contract.methods.approve(tokenTransferProxyAddr, MAX_UINT_256.toString()).send({
      from: account
    })
    if (!res.status) {
      throw new ElementError({ code: '2001', message: 'tokenTransferProxyAddr approve()' })
    }
  }
  return true
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
      throw new ElementError({ code: '2001', message: 'ERC1155 NFTs setApprovalForAll()' })
    }
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
      throw new ElementError({ code: '2001', message: 'ERC721 NFTs approve()' })
    }
  }
  return true
}
