import { Base } from './base'

const makeTokenIdForOwner = async (contract: any, account: string, index: number, supply: number): Promise<any> => {
  let res = await contract.methods.makeID(account, index, supply).send({
    from: account
  })
  return contract.methods.newID().call()
}

;(async () => {
  let base = new Base()
  await base.init()
  let sellAccount = base.accounts[0].address
  let buyAccount = base.accounts[1].address
  let newAccount = base.accounts[2].address
  let myAccount = base.accounts[3].address
  const order = base.orders
  let elementAssetContract = order.elementSharedAsset
  let exchangeProxyRegistryContract = order.exchangeProxyRegistry

  const makeTokenIDContract = order.makeTokenID
  let tokenId = await makeTokenIdForOwner(makeTokenIDContract, myAccount, 10, 1)
  console.log('tokenId', tokenId)

  // let tokenId = '33716853113536161489978336371468443552125006904605057389181032253315616866305'
  // let tokenId = '90210126015188922394389706191735331715798420249899639875546259613237645410305'

  // 如对应token id 的资产未创建 未false
  let exists = await elementAssetContract.methods.exists(tokenId).call()

  let tokenIdOwner
  // token id 的 creator
  if (exists) {
    tokenIdOwner = await elementAssetContract.methods.creator(tokenId).call()
  } else {
    tokenIdOwner = await elementAssetContract.methods.creator(tokenId).call()
  }

  // 资产合约拥有者，能直接执行 mint
  let ower = await elementAssetContract.methods.owner().call()

  // 验证创建者是否拥有
  let bal = await elementAssetContract.methods.balanceOf(tokenIdOwner, tokenId).call()

  console.log(exists, tokenIdOwner, bal)
})()
