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

let matchOrder = {
  buy: {
    exchange: '0x1a972898de9e2575b4abe88e1bf2f59b3d4b0c5d',
    maker: '0x28989099df975acf0c6a1db28c4a4805ae5e2fc8',
    taker: '0x0000000000000000000000000000000000000000',
    makerRelayerFee: '250',
    takerRelayerFee: '0',
    makerProtocolFee: '0',
    takerProtocolFee: '0',
    makerReferrerFee: '0',
    feeMethod: 1,
    feeRecipient: '0x0000000000000000000000000000000000000000',
    side: 0,
    saleKind: 0,
    target: '0x4cddbf865ee2a1a3711648bb192e285f290f7985',
    howToCall: 0,
    dataToCall:
      '0xf242432a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000028989099df975acf0c6a1db28c4a4805ae5e2fc87335bae9c88c59382621a2fbe08a353a93510f56000000000000010000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000',
    replacementPattern:
      '0x00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    staticTarget: '0x0000000000000000000000000000000000000000',
    staticExtradata: '0x',
    paymentToken: '0x0000000000000000000000000000000000000000',
    quantity: '1',
    basePrice: '120000000000000000',
    extra: '0',
    listingTime: '1621414946',
    expirationTime: '0',
    salt: '57273066295336458524014953983813601448398047887629750316157953716674960007693',
    metadata: {
      asset: {
        id: '52110910509117159886520023034677676808462086871028572901793699248975699247105',
        address: '0x4cddbf865ee2a1a3711648bb192e285f290f7985',
        quantity: '1'
      },
      schema: 'ERC1155',
      referrerAddress: 'undefined'
    },
    v: 28,
    r: '0x68d5380f008828fade2558888e1c189a800791b53af03b727e6fa3822667d6f2',
    s: '0x62c47317f0f25eda9b32d7dbc60e99c0a2f0824ad41ba078cf9452657c11d762',
    hash: '0x0edd3662f397fd5efac121b8d4c2fe9a475d413829becf6a3270f255ba267e2a'
  },
  sell: {
    exchange: '0x1a972898de9e2575b4abe88e1bf2f59b3d4b0c5d',
    maker: '0x7335bae9c88c59382621a2fbe08a353a93510f56',
    taker: '0x0000000000000000000000000000000000000000',
    makerRelayerFee: '250',
    takerRelayerFee: '0',
    makerProtocolFee: '0',
    takerProtocolFee: '0',
    makerReferrerFee: '0',
    feeMethod: 1,
    feeRecipient: '0x7335bae9c88c59382621a2fbe08a353a93510f56',
    side: 1,
    saleKind: 0,
    target: '0x4cddbf865ee2a1a3711648bb192e285f290f7985',
    howToCall: 0,
    dataToCall:
      '0xf242432a0000000000000000000000007335bae9c88c59382621a2fbe08a353a93510f5600000000000000000000000000000000000000000000000000000000000000007335bae9c88c59382621a2fbe08a353a93510f56000000000000010000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000',
    replacementPattern:
      '0x000000000000000000000000000000000000000000000000000000000000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    staticTarget: '0x0000000000000000000000000000000000000000',
    staticExtradata: '0x',
    paymentToken: '0x0000000000000000000000000000000000000000',
    quantity: '1',
    basePrice: '120000000000000000',
    extra: '0',
    listingTime: '1621414946',
    expirationTime: '0',
    salt: '32722664770772996788512352781402623973083475230328869266204863137774564679719',
    metadata: {
      asset: {
        id: '52110910509117159886520023034677676808462086871028572901793699248975699247105',
        address: '0x4cddbf865ee2a1a3711648bb192e285f290f7985',
        quantity: '1'
      },
      schema: 'ERC1155'
    },
    v: 27,
    r: '0xdb3c4520c303ebc315cbb94110a9672352039ee314455c26ff1171ce2a73e289',
    s: '0x38af42efc3e5fa5eae05400781da6aa98eb5ab9b3df045130ea3b6e7144aeb6f',
    hash: '0x4a7f8fc6ba773c7d0a8fab5f5ea9156370be841ba37129e18d0c9288bea1a80c'
  }
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

    let _buy = orderFromJSON(matchOrder.buy)
    let _sell = orderFromJSON(matchOrder.sell)
    let check = await checkMatchOrder(base.contracts, _buy, _sell)
    console.log(check)
    // await checkOrder(base.contracts, _order)
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
