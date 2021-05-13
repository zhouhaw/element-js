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
    exchange: '0x1A972898De9e2575b4abe88E1Bf2F59B3d4b0c5D',
    maker: '0xc7711f36b2C13E00821fFD9EC54B04A60AEfbd1b',
    taker: '0x0000000000000000000000000000000000000000',
    makerRelayerFee: '250',
    takerRelayerFee: '0',
    makerProtocolFee: '0',
    takerProtocolFee: '0',
    feeMethod: 1,
    feeRecipient: '0x22d491bde2303f2f43325b2108d26f1eaba1e32b',
    side: 1,
    saleKind: 0,
    target: '0x4cddbf865ee2a1a3711648bb192e285f290f7985',
    howToCall: 0,
    calldata:
      '0xf242432a000000000000000000000000c7711f36b2c13e00821ffd9ec54b04a60aefbd1b0000000000000000000000000000000000000000000000000000000000000000c7711f36b2c13e00821ffd9ec54b04a60aefbd1b0000000000022b0000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000',
    replacementPattern:
      '0x000000000000000000000000000000000000000000000000000000000000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    staticTarget: '0x0000000000000000000000000000000000000000',
    staticExtradata: '0x',
    paymentToken: '0x37e5C2ADEcAfb0f5d9335d69c62dBae0aD610E3c',
    basePrice: '2000000000000000',
    extra: '0',
    listingTime: '1620876031',
    expirationTime: '0',
    salt: '80637658474546936962767065608089687488683089570481138238186668782419686753981',
    metadata: {
      schema: 'ERC1155',
      asset: {
        id: '90210126015188922394389706191735331715798420249899639875546259613237645410305',
        address: '0x4cddbf865ee2a1a3711648bb192e285f290f7985',
        quantity: '1',
        data: ''
      }
    },
    hash: '0xfce58bbf13db19ea749a8056b87a8d1dc207844b979342e48e71dd500d28ff37',
    r: '0x7a4153a44fe095e66ecc10a640a14a92927429087e215bfae581958bb75a4d40',
    s: '0x54f38d1ba1d2f9a3e16c94e0c5ee999362839e2131b14b208add06889c11da75',
    v: 27,
    dataToCall:
      '0xf242432a000000000000000000000000c7711f36b2c13e00821ffd9ec54b04a60aefbd1b0000000000000000000000000000000000000000000000000000000000000000c7711f36b2c13e00821ffd9ec54b04a60aefbd1b0000000000022b0000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000',
    quantity: '1',
    makerReferrerFee: '0'
  }
  let sell = await orderFromJSON(sellParm)

  let tokenId = sell.metadata.asset.id

  const buyParm = {
    exchange: '0x1A972898De9e2575b4abe88E1Bf2F59B3d4b0c5D',
    maker: '0x28989099Df975aCF0c6a1DB28c4A4805aE5e2FC8',
    taker: '0xc7711f36b2C13E00821fFD9EC54B04A60AEfbd1b',
    makerRelayerFee: '250',
    takerRelayerFee: '0',
    makerProtocolFee: '0',
    takerProtocolFee: '0',
    feeMethod: 1,
    feeRecipient: '0x0000000000000000000000000000000000000000',
    side: 0,
    saleKind: 0,
    target: '0x4cddbf865ee2a1a3711648bb192e285f290f7985',
    howToCall: 0,
    calldata:
      '0xf242432a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000028989099df975acf0c6a1db28c4a4805ae5e2fc8c7711f36b2c13e00821ffd9ec54b04a60aefbd1b0000000000022b0000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000',
    replacementPattern:
      '0x00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    staticTarget: '0x0000000000000000000000000000000000000000',
    staticExtradata: '0x',
    paymentToken: '0x37e5C2ADEcAfb0f5d9335d69c62dBae0aD610E3c',
    basePrice: '2000000000000000',
    extra: '0',
    listingTime: '1620876031',
    expirationTime: '0',
    salt: '22428954075410606868305313128623320179451487965803971812235322692985300149292',
    metadata: {
      schema: 'ERC1155',
      asset: {
        id: '90210126015188922394389706191735331715798420249899639875546259613237645410305',
        address: '0x4cddbf865ee2a1a3711648bb192e285f290f7985',
        quantity: '1',
        data: ''
      }
    },
    hash: '0x501c7fe2fe30cdbfb0579e1002b9f1638fde23e3f6a7a23055ce52a1f55bb418',
    r: '0xedae4772fab2de5321e638d679a23b4a1d18c2bfae7fea6567831d0b3dc08af7',
    s: '0x435978ce5e27c707c90a329f2133e33bc9bf96ae92f83386fc0f89591aed42d6',
    v: 28,
    dataToCall:
      '0xf242432a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000028989099df975acf0c6a1db28c4a4805ae5e2fc8c7711f36b2c13e00821ffd9ec54b04a60aefbd1b0000000000022b0000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000',
    quantity: '1',
    makerReferrerFee: '0'
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
