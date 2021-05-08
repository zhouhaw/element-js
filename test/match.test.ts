import Web3 from 'web3'
import { getTokenList, Network, Orders } from '../src'

import { orderFromJSON } from '../src/utils'
import { ElementSchemaName, Asset } from '../src/types'

const abiPath = '../abi/'
const ElementSharedAsset = require(`${abiPath}ElementSharedAsset.json`)

// let web3 = new Web3('http://39.102.101.142:8555') // net id 8555
const web3 = new Web3('http://39.102.101.142:8545') // net id 100
const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'
const WETHAddr = '0x92893Ed51e36243d30BD51f805A7eC3b83fD938c'

const checkBuyAccountBalance = async (web3: any, erc20: any, account: string) => {
  const ethBal = await web3.eth.getBalance(account)
  if (Number(ethBal) == 0) {
    return false
  }
  console.log(`buyer ETH Balance: ${ethBal}`)

  // let buyBal = await WETHContract.methods.balanceOf(buyAccount).call();
  const buyBal = await erc20.methods.balanceOf(account).call()
  if (Number(buyBal) == 0) {
    return false
  }
  console.log('buyAccount %s WETH balance %s', account, buyBal)
  return true
}

let tokenId = '52110910509117159886520023034677676808462086871028572901793699248975699247105'

let assetAddr = '0x1B083283024F8d6799bfebF79A26cdC683aB0677'.toLowerCase() // ElementSharedAsset.networks[100].address
const nftContract = new web3.eth.Contract(ElementSharedAsset.abi, assetAddr, {
  gas: 80e4
})
let asset = {
  tokenId,
  tokenAddress: assetAddr,
  schemaName: ElementSchemaName.ERC1155
} as Asset
;(async () => {
  try {
    // your private keys
    web3.eth.accounts.wallet.add('0x078bad8a23809d79c021f84e6c56e900f8082b05e51872e32361ada65a144dea')
    web3.eth.accounts.wallet.add('0x59ae5462c42c8b9e4a7c760f4021fdfd1ae551a42ae3a7261ecd21c747bfef89')

    const sellAccount = web3.eth.accounts.wallet[1].address
    const buyAccount = web3.eth.accounts.wallet[0].address

    console.log('sellAccount:%s, buyAccount: %s', sellAccount, buyAccount)

    web3.eth.defaultAccount = buyAccount

    const networkID: number = await web3.eth.net.getId()

    const order = new Orders(web3, {
      networkName: Network.Private,
      networkID,
      account: sellAccount
    })
    const erc20 = order.erc20.clone()
    erc20.options.address = WETHAddr
    await checkBuyAccountBalance(web3, erc20, buyAccount)

    let wETHAddr = '0x92893Ed51e36243d30BD51f805A7eC3b83fD938c' //WETH.networks[networkID].address

    const sellParm = {
      accountAddress: sellAccount,
      paymentTokenAddress: wETHAddr,
      asset,
      startAmount: 1.2
    }
    let sellOrderJson = await order.createSellOrder(sellParm)

    let sellOrder = orderFromJSON(sellOrderJson)
    const matchParm = {
      sellOrder,
      accountAddress: buyAccount,
      paymentTokenAddress: wETHAddr,
      asset,
      startAmount: 1.2
    }

    let exists = await nftContract.methods.exists(tokenId).call()
    // let creator = await nftContract.methods.creator(tokenId).call()

    // 检查买/卖家NFT余额
    let sellerNFTbalance = await nftContract.methods.balanceOf(sellAccount, tokenId).call()
    if (exists && sellerNFTbalance == '0') {
      throw new Error('seller account balance <1 !')
    }

    const match = await order.matchOrder(matchParm)

    console.log('order match success')
    // await go()
  } catch (error) {
    console.log(error)
  }
})()
