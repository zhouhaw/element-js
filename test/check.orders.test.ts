import { Base } from './base'

import { NULL_ADDRESS } from '../src/utils/constants'
import { getAccountNFTsBalance } from '../src/utils/check'

import { orderFromJSON, transferFromERC1155 } from '../src/utils'
import { Asset, ElementSchemaName, Network, Orders, OrderCheckStatus, checkMatchOrder, checkOrder } from '../src'

let orderHashError = {
  exchange: '0x5206e78b21ce315ce284fb24cf05e0585a93b1d9',
  maker: '0xe7ad0f477f1fc8542a17db7fec3fe42d49a274fa',
  taker: '0x0000000000000000000000000000000000000000',
  makerRelayerFee: '0',
  takerRelayerFee: '250',
  makerProtocolFee: '0',
  takerProtocolFee: '0',
  makerReferrerFee: '0',
  feeMethod: 1,
  feeRecipient: '0x5b3256965e7c3cf26e11fcaf296dfc8807c01073',
  side: 0,
  saleKind: 0,
  target: '0xee45b41d1ac24e9a620169994deb22739f64f231',
  howToCall: 0,
  dataToCall:
    '0xf242432a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000090284230d4796d307f9cc4a8d139867bd749be619d4f20c5e7c674372df2b183c8c60c57fe914608000000000000020000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000',
  replacementPattern:
    '0x00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
  staticTarget: '0x0000000000000000000000000000000000000000',
  staticExtradata: '0x',
  paymentToken: '0xc778417e063141139fce010982780140aa0cd5ab',
  quantity: '1',
  basePrice: '400000000000000000',
  extra: '0',
  listingTime: '1617173500',
  expirationTime: '1617778370',
  salt: '7453038615352877641532201187925352356534655125814007728464873502994526692512',
  metadata: {
    asset: {
      id: '71152924337091684665570692630096933358832357794260906510119983940825698533377',
      address: '0xee45b41d1ac24e9a620169994deb22739f64f231',
      quantity: '1'
    },
    schema: 'ERC1155'
  },
  v: 27,
  r: '0xdc8f2645817217553d2a566a9a9c210c0f1eb2a34e70c9e7d723375c88078e1e',
  s: '0x458d92b03d8e214f9b019442cc344ce5c2203f519d000ddbd763d22126ae22b9',
  hash: '0x602431a784e5cbd5830813b29f578026447e02915230644eb7e042bf21166737'
}
;(async () => {
  let base = new Base()
  await base.init()
  let sellAccount = base.accounts[0].address
  let buyAccount = base.accounts[1].address
  const order = base.orders
  let wETHAddr = NULL_ADDRESS

  let tokenId = '52110910509117159886520023034677676808462086871028572901793699248975699247105'
  let assetAddr = order.elementSharedAssetAddr.toLowerCase() // ElementSharedAsset.networks[100].address

  try {
    let _order = orderFromJSON(orderHashError)
    await checkOrder(base.contracts, _order)
  } catch (e) {
    console.log(e)
  }
  return

  let asset = {
    tokenId,
    tokenAddress: assetAddr,
    schemaName: ElementSchemaName.ERC1155
  } as Asset

  //------createBuyOrder
  const buyParm = {
    accountAddress: buyAccount,
    paymentTokenAddress: wETHAddr,
    asset,
    startAmount: 0.12
  }

  function next<OrderCheckStatus>(arg: OrderCheckStatus) {
    console.log(arg)
  }

  base.web3.eth.defaultAccount = buyAccount
  const buyOrder = await order.createBuyOrder(buyParm, { next })
  console.log('buyOrder', buyOrder)

  //------createSellOrder

  const buyNFTs = order.erc1155.clone()
  buyNFTs.options.address = assetAddr
  let assetBal = await getAccountNFTsBalance(buyNFTs, sellAccount, tokenId)

  if (assetBal == 0) {
    let tx = await transferFromERC1155(buyNFTs, buyAccount, sellAccount, tokenId, 1)
    console.log('transferFromERC1155 to Sell', tx)
    return
  }

  const sellParm = {
    asset,
    accountAddress: sellAccount,
    startAmount: 0.12,
    paymentTokenAddress: wETHAddr,
    expirationTime: 0
  }
  base.web3.eth.defaultAccount = sellAccount
  let sellOrderJson = await order.createSellOrder(sellParm)

  console.log('createSellOrder', sellOrderJson)
})()
