import { Base } from './base'

import { NULL_ADDRESS } from '../../src/utils/constants'
import { getAccountNFTsBalance } from '../../src/utils/check'

import { orderFromJSON, transferFromERC1155, getCurrentPrice } from '../../src'
import {
  Asset,
  ElementSchemaName,
  Network,
  Orders,
  OrderCheckStatus,
  getAccountBalance,
  chainValueConvert
} from '../../src'
;(async () => {
  let base = new Base()
  await base.init()
  let sellAccount = base.accounts[3].address
  let buyAccount = base.accounts[2].address
  const order = base.orders
  let wETHAddr = NULL_ADDRESS

  console.log('sell', sellAccount, 'buy', buyAccount)

  // const payToken = order.erc20.clone()
  // let wETHAddr = order.WETHAddr
  // payToken.options.address = wETHAddr
  // let bal = await getAccountBalance(order.web3, buyAccount, payToken)

  let tokenId = '33716853113536161489978336371468443552125006904605057389181032258813175007184'
  let assetAddr = order.elementSharedAssetAddr.toLowerCase() // ElementSharedAsset.networks[100].address

  let asset = {
    tokenId,
    tokenAddress: assetAddr,
    schemaName: ElementSchemaName.ERC1155
  } as Asset

  const sellParm = {
    asset,
    accountAddress: sellAccount,
    startAmount: 5,
    endAmount: 2,
    quantity: 2,
    paymentTokenAddress: wETHAddr,
    listingTime: Number.parseInt(`${Date.now() / 1000 - 2 * 60}`, 10),
    expirationTime: Number.parseInt(`${Date.now() / 1000 + 2 * 60}`, 10)
  }

  base.web3.eth.defaultAccount = sellAccount
  let sellOrderJson = await order.createSellOrder(sellParm)
  let sell = orderFromJSON(sellOrderJson)
  const basePrice = await getCurrentPrice(base.contracts.exchangeHelper, sell)

  let buyPrice = Number(chainValueConvert(basePrice, 18)) + 1
  console.log(`getCurrentPrice ${basePrice} buyPrice: ${buyPrice}`)

  //------createBuyOrder
  const buyParm = {
    accountAddress: buyAccount,
    paymentTokenAddress: sell.paymentToken,
    asset,
    startAmount: buyPrice,
    quantity: sell.quantity,
    sellOrder: sell
  }

  function next<OrderCheckStatus>(arg: OrderCheckStatus) {
    console.log('next:', arg)
  }

  base.web3.eth.defaultAccount = buyAccount
  const buyOrder = await order.createBuyOrder(buyParm, { next })
  // console.log('buyOrder', buyOrder)

  //------createSellOrder

  const buyNFTs = order.erc1155.clone()
  buyNFTs.options.address = assetAddr
  let sellAssetBal = await getAccountNFTsBalance(buyNFTs, sellAccount, tokenId)
  let buyAssetBal = await getAccountNFTsBalance(buyNFTs, buyAccount, tokenId)

  if (sellAssetBal == 0) {
    // let tx = await transferFromERC1155(buyNFTs, buyAccount, sellAccount, tokenId, 1)
    console.log('transferFromERC1155 to Sell', 'tx')
    return
  }

  let buy = orderFromJSON(buyOrder)

  let buyBal = await getAccountBalance(order.web3, buyAccount)
  let sellBal = await getAccountBalance(order.web3, sellAccount)
  console.log(
    `Match before Buyer  ${chainValueConvert(buyBal.ethBal, 18).toString()} Seller ${chainValueConvert(
      sellBal.ethBal,
      18
    )}, sell price ${chainValueConvert(sell.basePrice, 18)}
    Seller bal ${sellAssetBal} , Buyer Bal ${buyAssetBal} `
  )

  base.web3.eth.defaultAccount = buyAccount
  let match = await order.matchOrder({ buy, sell, accountAddress: buyAccount })

  if (match) {
    buyBal = await getAccountBalance(order.web3, buyAccount)
    sellBal = await getAccountBalance(order.web3, sellAccount)
    sellAssetBal = await getAccountNFTsBalance(buyNFTs, sellAccount, tokenId)
    buyAssetBal = await getAccountNFTsBalance(buyNFTs, buyAccount, tokenId)
    console.log(
      `Match after Buyer ${chainValueConvert(buyBal.ethBal, 18).toString()} Seller ${chainValueConvert(
        sellBal.ethBal,
        18
      )},buy price ${chainValueConvert(buy.basePrice, 18)} 
       Seller bal ${sellAssetBal} , Buyer Bal ${buyAssetBal} `
    )
  } else {
    console.log('matchOrder fail')
  }

  // console.log('matchOrder', { buy: buyOrder, sell: sellOrderJson })
})()