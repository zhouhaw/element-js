import { Base } from './base'
import { Network } from '../src/types'

import {
  transferFromERC1155,
  getAccountBalance,
  getAccountNFTsBalance,
  registerProxy,
  approveTokenTransferProxy,
  approveERC1155TransferProxy,
  orderFromJSON,
  getTokenIDOwner,
  getSchemaList,
  encodeSell,
  encodeBuy
} from '../src/utils'
;(async () => {
  let base = new Base()
  await base.init()
  let sellAccount = base.accounts[1].address
  let buyAccount = base.accounts[0].address
  const order = base.orders
  const payToken = order.erc20.clone()
  let wETHAddr = order.WETHAddr
  payToken.options.address = wETHAddr
  let bal = await getAccountBalance(order.web3, buyAccount, payToken)

  // let tokenId = '52110910509117159886520023034677676808462086871028572901793699248975699247105'
  let tokenId = '52110910509117159886520023034677676808462086871028572901793699467778513174529'
  let assetAddr = order.elementSharedAssetAddr.toLowerCase()

  //---------- match order buy--------

  // 检查买家是否有 资产
  const buyNFTs = order.erc1155.clone()
  buyNFTs.options.address = assetAddr

  const sellParm = {
    hash: '0x96eac81919829a271b95302b6ba5c04ff6c7381de49bc1595197aaaf8af671ed',
    cancelledOrFinalized: false,
    metadata: {
      __typename: 'OrderMetadataType',
      asset: {
        __typename: 'OrderAssetType',
        id: '25403046968847934954500617551918385923381343357399008756217544287555139141633',
        address: '0x4cddbf865ee2a1a3711648bb192e285f290f7985',
        quantity: '1'
      },
      schema: 'ERC1155'
    },
    quantity: '1',
    exchange: '0x1a972898de9e2575b4abe88e1bf2f59b3d4b0c5d',
    makerAccount: '0x38299d74a169e68df4da85fb12c6fd22246add9f',
    takerAccount: '0x0000000000000000000000000000000000000000',
    maker: '0x38299d74a169e68df4da85fb12c6fd22246add9f',
    taker: '0x0000000000000000000000000000000000000000',
    makerRelayerFee: '250',
    takerRelayerFee: '0',
    makerProtocolFee: '0',
    takerProtocolFee: '0',
    makerReferrerFee: '0',
    waitingForBestCounterOrder: false,
    feeMethod: 1,
    feeRecipientAccount: '0x38299d74a169e68df4da85fb12c6fd22246add9f',
    feeRecipient: '0x38299d74a169e68df4da85fb12c6fd22246add9f',
    side: 1,
    saleKind: 0,
    target: '0x4cddbf865ee2a1a3711648bb192e285f290f7985',
    howToCall: 0,
    dataToCall:
      '0xf242432a00000000000000000000000038299d74a169e68df4da85fb12c6fd22246add9f000000000000000000000000000000000000000000000000000000000000000038299d74a169e68df4da85fb12c6fd22246add9f000000000000040000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000',
    replacementPattern:
      '0x000000000000000000000000000000000000000000000000000000000000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    staticTarget: '0x0000000000000000000000000000000000000000',
    staticExtradata: '0x',
    paymentToken: '0x0000000000000000000000000000000000000000',
    basePrice: '100000000000000000',
    extra: '0',
    currentBounty: '0',
    currentPrice: '100000000000000000',
    createdTime: '1620807486',
    listingTime: '1620807352',
    expirationTime: '1621585020',
    salt: '56954309503114221610499456687210368520843423216309691816019484733793463809370',
    v: 27,
    r: '0xe4d1ee5cf4789863e0217a53925db40a4ebeaf5be227505ce02d869614ac1b66',
    s: '0x313d6eda4f44ed4133e59150cdfb5f0c08e5d2716f9f8f54eb5345e32273fbc9',
    paymentTokenContract: '0x0000000000000000000000000000000000000000'
  }
  let sell = await orderFromJSON(sellParm)

  const buyParm = {
    exchange: '0x1a972898de9e2575b4abe88e1bf2f59b3d4b0c5d',
    maker: '0x7335bae9c88c59382621a2fbe08a353a93510f56',
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
      '0xf242432a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000007335bae9c88c59382621a2fbe08a353a93510f5638299d74a169e68df4da85fb12c6fd22246add9f000000000000040000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000',
    replacementPattern:
      '0x00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    staticTarget: '0x0000000000000000000000000000000000000000',
    staticExtradata: '0x',
    paymentToken: '0x0000000000000000000000000000000000000000',
    quantity: '1',
    basePrice: '100000000000000000',
    extra: '0',
    listingTime: '1620807384',
    expirationTime: '1621585020',
    salt: '42452497611828499052618237729090790964287430391365083250162747766598766474088',
    metadata: {
      asset: {
        id: '25403046968847934954500617551918385923381343357399008756217544287555139141633',
        address: '0x4cddbf865ee2a1a3711648bb192e285f290f7985',
        quantity: '1'
      },
      schema: 'ERC1155'
    },
    v: 28,
    r: '0x67a56009a5d90feaf4b8e165d41aacd12667a294d1ca73f106bbe0d5da9583ab',
    s: '0x2bd2ea6386cbe4300e1f34bca071d7e7d824731134a51b9a07453ecb9b9acd0b',
    hash: '0x07b0a31963e3f6c556b96abe8a0a5199bb5c18576e5e8abdb1e9858f98223266'
  }
  let buy = orderFromJSON(buyParm)

  let owner = await getTokenIDOwner(base.contracts.elementSharedAsset, sell.metadata.asset.id)
  let sellIsOwner = sell.maker.toLowerCase() == owner.toLowerCase()
  if (!sellIsOwner) {
    console.log('sellIsOwner', sellIsOwner)
    return false
  }

  let assetBal = await getAccountNFTsBalance(buyNFTs, buy.maker, sell.metadata.asset.id)

  if (assetBal == 0) {
    // let tx = await transferFromERC1155(buyNFTs, buyAccount, sellAccount, tokenId)
    console.log('sell maker assetBal  0')
    return
  }

  // base.web3.eth.defaultAccount = sellAccount
  // let match = await order.matchOrder({ buy, sell, accountAddress: sellAccount })

  // // buy 一口价

  if (buy.maker.toLowerCase() != buyAccount.toLowerCase()) {
    console.log('buy.maker != buyAccount')
    return false
  }

  let schemas = getSchemaList(Network.Private, sell.metadata.schema)
  let { target, dataToCall, replacementPattern } = encodeSell(schemas[0], sell.metadata.asset, sell.maker)

  if (dataToCall != sell.dataToCall) {
    console.log('sell.dataToCall error')
  }

  if (target != sell.target) {
    console.log('sell.target error')
  }

  if (replacementPattern != sell.replacementPattern) {
    console.log('sell.replacementPattern error')
  }

  base.web3.eth.defaultAccount = buyAccount
  let match = await order.matchOrder({ buy, sell, accountAddress: buyAccount })

  let newAssetBal = await getAccountNFTsBalance(buyNFTs, sellAccount, tokenId)

  console.log('order match ', match, assetBal, newAssetBal)
})()
