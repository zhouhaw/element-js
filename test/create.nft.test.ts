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
  const order = base.orders
  let elementAssetContract = order.elementSharedAsset
  let exchangeProxyRegistryContract = order.exchangeProxyRegistry

  //0x7335Bae9c88c59382621A2FBE08A353a93510F56

  const makeTokenIDContract = order.makeTokenID
  // let tokenId = await makeTokenIdForOwner(makeTokenIDContract, sellAccount, 200, 1)
  let tokenId = '25403046968847934954500617551918385923381343357399008756217544287555139141633'
  // '0x4cDdBf865Ee2A1a3711648Bb192E285f290f7985/ 52110910509117159886520023034677676808462086871028572901793699248975699247105'

  // '0x4cddbf865ee2a1a3711648bb192e285f290f7985/ 25403046968847934954500617551918385923381343357399008756217544284256604258305

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
