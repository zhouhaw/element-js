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
    __typename: 'OrderType',
    id: '96',
    createdDate: '2021-05-12T20:58:46+08:00',
    closingDate: '1970-01-01T08:00:00+08:00',
    expirationTime: 0,
    listingTime: 1620824326,
    orderHash: '0xb70c47c8fbee12da26848c11c75be8dc5e8503707a7847c3c2c51b9881e0f9a5',
    metadata: {
      __typename: 'OrderMetadataType',
      asset: {
        __typename: 'OrderAssetType',
        id: '105886420831251411528890303004419979784764244768332317573040781519418810171393',
        address: '0x4cddbf865ee2a1a3711648bb192e285f290f7985',
        quantity: '1'
      },
      schema: 'ERC1155'
    },
    exchange: '0x1a972898de9e2575b4abe88e1bf2f59b3d4b0c5d',
    maker: '0xea199722372dea9df458dbb56be7721af117a9bc',
    taker: '0x0000000000000000000000000000000000000000',
    makerRelayerFee: '250',
    takerRelayerFee: '0',
    makerProtocolFee: '0',
    takerProtocolFee: '0',
    feeRecipient: '0xea199722372dea9df458dbb56be7721af117a9bc',
    feeMethod: 1,
    side: 1,
    saleKind: 0,
    target: '0x4cddbf865ee2a1a3711648bb192e285f290f7985',
    howToCall: 0,
    dataToCall:
      '0xf242432a000000000000000000000000ea199722372dea9df458dbb56be7721af117a9bc0000000000000000000000000000000000000000000000000000000000000000ea199722372dea9df458dbb56be7721af117a9bc000000000000010000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000',
    replacementPattern:
      '0x000000000000000000000000000000000000000000000000000000000000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    staticTarget: '0x0000000000000000000000000000000000000000',
    staticExtradata: '0x',
    paymentToken: '0x0000000000000000000000000000000000000000',
    basePrice: '1000000000000000000',
    extra: '0',
    quantity: '1',
    salt: '70401475607282464405055832006713955685479050297907608870107662798843161877590',
    v: '27',
    r: '0x3c2c39cb6b55dc9b3712bebeb062a0f524f29cf9bb1ad6f7b7eb77578e920a5b',
    s: '0x634dd2852c23ef311a6171184446c8c15b9319dab442ad5507ee692c2dda3609',
    approvedOnChain: false,
    cancelled: false,
    finalized: false,
    markedInvalid: false,
    hash: '0xb70c47c8fbee12da26848c11c75be8dc5e8503707a7847c3c2c51b9881e0f9a5'
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
      '0xf242432a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000007335bae9c88c59382621a2fbe08a353a93510f56ea199722372dea9df458dbb56be7721af117a9bc000000000000010000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000',
    replacementPattern:
      '0x00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    staticTarget: '0x0000000000000000000000000000000000000000',
    staticExtradata: '0x',
    paymentToken: '0x0000000000000000000000000000000000000000',
    quantity: '1',
    basePrice: '1000000000000000000',
    extra: '0',
    listingTime: '1620873457',
    expirationTime: '0',
    salt: '83035369007942084490805185966971575247802455355530301592636485416845147337668',
    metadata: {
      asset: {
        id: '105886420831251411528890303004419979784764244768332317573040781519418810171393',
        address: '0x4cddbf865ee2a1a3711648bb192e285f290f7985',
        quantity: '1'
      },
      schema: 'ERC1155'
    },
    v: 28,
    r: '0xda984eac64c508d16cab3e0fe551f2d345b91115f919dd2dd2df468964665f07',
    s: '0x3404512c4202f85c71e05504d13b718cdaef4bb53895434885c569d61971738b',
    hash: '0x8d2cd586b4fe2e6222748c1434411faa56031342434312159cd0db6b67d9cbc1'
  }
  let buy = orderFromJSON(buyParm)

  let owner = await getTokenIDOwner(base.contracts.elementSharedAsset, sell.metadata.asset.id)
  let sellIsOwner = sell.maker.toLowerCase() == owner.toLowerCase()
  if (!sellIsOwner) {
    console.log('sellIsOwner', sellIsOwner)
    return false
  }

  let assetBal = await getAccountNFTsBalance(buyNFTs, sell.maker, sell.metadata.asset.id)

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
