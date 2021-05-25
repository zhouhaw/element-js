import { Base } from './base'

import { NULL_ADDRESS } from '../src/utils/constants'
import { getAccountNFTsBalance } from '../src/utils/check'

import { orderFromJSON, transferFromERC1155 } from '../src/utils'
import { Asset, ElementSchemaName, Network, Orders, OrderCheckStatus, getAccountBalance } from '../src'
;(async () => {
  let base = new Base()
  await base.init()
  let sellAccount = base.accounts[1].address
  let buyAccount = base.accounts[0].address
  const order = base.orders
  let wETHAddr = NULL_ADDRESS

  // const payToken = order.erc20.clone()
  // let wETHAddr = order.WETHAddr
  // payToken.options.address = wETHAddr
  // let bal = await getAccountBalance(order.web3, buyAccount, payToken)
  let buyBal = await getAccountBalance(order.web3, buyAccount)
  let sellBal = await getAccountBalance(order.web3, sellAccount)
  console.log(`Match before Buyer ${buyBal.ethBal.toString()} Seller ${sellBal.ethBal.toString()}`)
  let tokenId = '52110910509117159886520023034677676808462086871028572901793699248975699247105'
  let assetAddr = order.elementSharedAssetAddr.toLowerCase() // ElementSharedAsset.networks[100].address

  let asset = {
    tokenId,
    tokenAddress: assetAddr,
    schemaName: ElementSchemaName.ERC1155
  } as Asset

  const sellParm = {
    asset,
    accountAddress: sellAccount,
    startAmount: 2000,
    endAmount: 1000,
    paymentTokenAddress: wETHAddr,
    listingTime: 1621512531,
    expirationTime: 1621513731
  }
  //     endAmount: 0.1,
  // expirationTime: 0 // 1621509587
  base.web3.eth.defaultAccount = sellAccount
  // let sellOrderJson = await order.createSellOrder(sellParm)

  //------createBuyOrder
  const buyParm = {
    asset: {
      __typename: 'OrderAssetType',
      id: '33716853113536161489978336371468443552125006904605057389181032256614151749832',
      address: '0x4cddbf865ee2a1a3711648bb192e285f290f7985',
      quantity: '1'
    },
    accountAddress: '0x7335Bae9c88c59382621A2FBE08A353a93510F56',
    startAmount: '6',
    paymentTokenAddress: '0x0000000000000000000000000000000000000000',
    sellOrder: {
      hash: '0x3c0d4db7e14516d761c1279af4c19808a34a4dd724b5f59dc648447d338c3390',
      cancelledOrFinalized: false,
      metadata: {
        __typename: 'OrderMetadataType',
        asset: {
          __typename: 'OrderAssetType',
          id: '33716853113536161489978336371468443552125006904605057389181032256614151749832',
          address: '0x4cddbf865ee2a1a3711648bb192e285f290f7985',
          quantity: '1'
        },
        schema: 'ERC1155'
      },
      quantity: '3',
      exchange: '0x1a972898de9e2575b4abe88e1bf2f59b3d4b0c5d',
      makerAccount: '0x4a8b1005816a31b07b25254a883761bacf297abc',
      takerAccount: '0x0000000000000000000000000000000000000000',
      maker: '0x4a8b1005816a31b07b25254a883761bacf297abc',
      taker: '0x0000000000000000000000000000000000000000',
      makerRelayerFee: '250',
      takerRelayerFee: '0',
      makerProtocolFee: '0',
      takerProtocolFee: '0',
      makerReferrerFee: '0',
      waitingForBestCounterOrder: false,
      feeMethod: 1,
      feeRecipientAccount: '0x4a8b1005816a31b07b25254a883761bacf297abc',
      feeRecipient: '0x4a8b1005816a31b07b25254a883761bacf297abc',
      side: 1,
      saleKind: 1,
      target: '0x4cddbf865ee2a1a3711648bb192e285f290f7985',
      howToCall: 0,
      dataToCall:
        '0xf242432a0000000000000000000000004a8b1005816a31b07b25254a883761bacf297abc00000000000000000000000000000000000000000000000000000000000000004a8b1005816a31b07b25254a883761bacf297abc0000000000000500000000c8000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000',
      replacementPattern:
        '0x000000000000000000000000000000000000000000000000000000000000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      staticTarget: '0x0000000000000000000000000000000000000000',
      staticExtradata: '0x',
      paymentToken: '0x0000000000000000000000000000000000000000',
      basePrice: '6000000000000000000',
      extra: '4000000000000000000',
      currentBounty: '0',
      currentPrice: '0',
      createdTime: '1621827403',
      listingTime: '1621825005',
      expirationTime: '1621911505',
      salt: '66282467631020211201124429340433503262964647627807771054833381454800083496245',
      v: 28,
      r: '0xca6011a3f36bdd567c2e2da45e6f56f2b04d5c79a97a3aab99519a0032015ada',
      s: '0x5b3568e705373dc3cf1d79e3db11c14cbbc94c27bb58040f46b727884c23a41a',
      paymentTokenContract: '0x0000000000000000000000000000000000000000'
    }
  }

  function next<OrderCheckStatus>(arg: OrderCheckStatus) {
    console.log(arg)
  }

  base.web3.eth.defaultAccount = buyAccount
  const buyOrder = await order.createBuyOrder(buyParm, { next })
  // console.log('buyOrder', buyOrder)

  //------createSellOrder

  const buyNFTs = order.erc1155.clone()
  buyNFTs.options.address = assetAddr
  let assetBal = await getAccountNFTsBalance(buyNFTs, sellAccount, tokenId)

  if (assetBal == 0) {
    let tx = await transferFromERC1155(buyNFTs, buyAccount, sellAccount, tokenId, 1)
    console.log('transferFromERC1155 to Sell', tx)
    return
  }

  // let buy = orderFromJSON(buyOrder)
  // let sell = orderFromJSON(sellOrderJson)
  // base.web3.eth.defaultAccount = buyAccount
  // let match = await order.matchOrder({ buy, sell, accountAddress: buyAccount })
  //
  // if (match) {
  //   buyBal = await getAccountBalance(order.web3, buyAccount)
  //   sellBal = await getAccountBalance(order.web3, sellAccount)
  //   console.log(`Match after Buyer ${buyBal.ethBal.toString()} Seller ${sellBal.ethBal.toString()}`)
  // }

  // console.log('matchOrder', { buy: buyOrder, sell: sellOrderJson })
})()
