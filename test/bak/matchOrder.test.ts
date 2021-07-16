import { Base } from './base'
import { Network } from '../../src/types'

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
} from '../../src/utils'
;(async () => {
  let base = new Base()
  await base.init()
  let sellAccount = base.accounts[2].address
  let buyAccount = '0x28989099Df975aCF0c6a1DB28c4A4805aE5e2FC8'
  const order = base.orders
  const payToken = order.erc20.clone()
  let wETHAddr = order.WETHAddr
  payToken.options.address = wETHAddr
  let bal = await getAccountBalance(order.web3, buyAccount, payToken)

  // let tokenId = '52110910509117159886520023034677676808462086871028572901793699248975699247105'
  // let tokenId = '52110910509117159886520023034677676808462086871028572901793699467778513174529'
  let assetAddr = order.elementSharedAssetAddr.toLowerCase()

  //---------- match order buy--------

  // 检查买家是否有 资产
  const buyNFTs = order.erc1155.clone()
  buyNFTs.options.address = assetAddr

  const sellParm = {
    exchange: '0x1a972898de9e2575b4abe88e1bf2f59b3d4b0c5d',
    maker: '0x4a8b1005816a31b07b25254a883761bacf297abc',
    taker: '0x0000000000000000000000000000000000000000',
    makerRelayerFee: '250',
    takerRelayerFee: '0',
    makerProtocolFee: '0',
    takerProtocolFee: '0',
    makerReferrerFee: '0',
    feeMethod: 1,
    feeRecipient: '0x4a8b1005816a31b07b25254a883761bacf297abc',
    side: 1,
    saleKind: 0,
    target: '0x4cddbf865ee2a1a3711648bb192e285f290f7985',
    howToCall: 0,
    dataToCall:
      '0xf242432a0000000000000000000000004a8b1005816a31b07b25254a883761bacf297abc00000000000000000000000000000000000000000000000000000000000000004a8b1005816a31b07b25254a883761bacf297abc000000000000020000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000',
    replacementPattern:
      '0x000000000000000000000000000000000000000000000000000000000000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    staticTarget: '0x0000000000000000000000000000000000000000',
    staticExtradata: '0x',
    paymentToken: '0x37e5c2adecafb0f5d9335d69c62dbae0ad610e3c',
    quantity: '1',
    basePrice: '3000000000000000',
    extra: '0',
    listingTime: '1620881817',
    expirationTime: '0',
    salt: '5708143416612246773753318346225547643225819641094356798971034130456405763373',
    metadata: {
      asset: {
        id: '33716853113536161489978336371468443552125006904605057389181032253315616866305',
        address: '0x4cddbf865ee2a1a3711648bb192e285f290f7985',
        quantity: '1'
      },
      schema: 'ERC1155'
    },
    v: 28,
    r: '0xc9059cb85521be2d05ffffb05f5340b5be7eeba22755cfce91c2ee45a9d0dc81',
    s: '0x4909e083a2cc60af751d643979ab25569412cccf66cc3f13395151ca6a0668fb',
    hash: '0xd014643df18ca365ec1841111ba8d878d6babcc2c03b1d81fd926295fae42ca7'
  }
  let sell = await orderFromJSON(sellParm)

  let tokenId = sell.metadata.asset.id

  const buyParm = {
    __typename: 'OrderType',
    id: '112',
    createdDate: '2021-05-13T12:56:40+08:00',
    closingDate: '1970-01-01T08:00:00+08:00',
    expirationTime: 0,
    listingTime: 1620881800,
    hash: '0x38e4e5bceb7c2c63d60a22773409063acc69c5781ebbc3d499b47389dbfbde60',
    metadata: {
      __typename: 'OrderMetadataType',
      asset: {
        __typename: 'OrderAssetType',
        id: '33716853113536161489978336371468443552125006904605057389181032253315616866305',
        address: '0x4cddbf865ee2a1a3711648bb192e285f290f7985',
        quantity: '1'
      },
      schema: 'ERC1155'
    },
    exchange: '0x1a972898de9e2575b4abe88e1bf2f59b3d4b0c5d',
    maker: '0x7335bae9c88c59382621a2fbe08a353a93510f56',
    taker: '0x4a8b1005816a31b07b25254a883761bacf297abc',
    makerRelayerFee: '250',
    takerRelayerFee: '0',
    makerProtocolFee: '0',
    takerProtocolFee: '0',
    feeRecipient: '0x0000000000000000000000000000000000000000',
    feeMethod: 1,
    side: 0,
    saleKind: 0,
    target: '0x4cddbf865ee2a1a3711648bb192e285f290f7985',
    howToCall: 0,
    dataToCall:
      '0xf242432a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000007335bae9c88c59382621a2fbe08a353a93510f564a8b1005816a31b07b25254a883761bacf297abc000000000000020000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000',
    replacementPattern:
      '0x00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    staticTarget: '0x0000000000000000000000000000000000000000',
    staticExtradata: '0x',
    paymentToken: '0x37e5c2adecafb0f5d9335d69c62dbae0ad610e3c',
    basePrice: '3000000000000000',
    extra: '0',
    quantity: '1',
    salt: '9940025480794592133800814146440082438976046980027270536278765126557707429690',
    v: '28',
    r: '0x9f80f4db70fd45ec135a93232c428b7c679a2db387ebc02562cfa352bc1be428',
    s: '0x74ed20d711b063e1e50d7893db49f6caa7a3d3bc1b650aa812a89c050799e75c',
    approvedOnChain: false,
    cancelled: false,
    finalized: false,
    markedInvalid: false
  }
  let buy = orderFromJSON(buyParm)

  let owner = await getTokenIDOwner(base.contracts.elementSharedAsset, sell.metadata.asset.id)
  let sellIsOwner = sell.maker.toLowerCase() == owner.toLowerCase()
  if (!sellIsOwner) {
    console.log('sellIsOwner', sellIsOwner)
    return false
  }

  let assetBal = await getAccountNFTsBalance(buyNFTs, sell.maker, tokenId)

  if (assetBal == 0) {
    // let tx = await transferFromERC1155(buyNFTs, buyAccount, sellAccount, tokenId)
    console.log('sell maker assetBal  0')
    return
  }

  //  buy 一口价
  // if (buy.maker.toLowerCase() != buyAccount.toLowerCase()) {
  //   console.log('buy.maker != buyAccount')
  //   return false
  // }

  // base.web3.eth.defaultAccount = buyAccount
  // let match = await order.matchOrder({ buy, sell, accountAddress: buyAccount })

  // sell accept
  // if (sell.maker.toLowerCase() != sellAccount.toLowerCase()) {
  //   console.log('sell.maker != sellAccount')
  //   return false
  // }

  base.web3.eth.defaultAccount = sellAccount
  let match = await order.matchOrder({ buy, sell, accountAddress: sellAccount })

  let newAssetBal = await getAccountNFTsBalance(buyNFTs, sellAccount, tokenId)

  console.log('order match ', match, assetBal, newAssetBal)
})()
