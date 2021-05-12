import { NULL_ADDRESS, MAX_UINT_256 } from './index'

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
    erc20Bal = erc20Bal = await erc20.methods.balanceOf(account).call()
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
export async function registerProxy(proxyRegistryContract: any, account: string): Promise<boolean> {
  let proxy = await proxyRegistryContract.methods.proxies(account).call()
  if (proxy === NULL_ADDRESS) {
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
  const amount = await erc20Contract.methods.allowance(account, tokenTransferProxyAddr).call()
  if (Number(amount) <= 1e18) {
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
