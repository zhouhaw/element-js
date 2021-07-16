import { Base } from './base'

import { NULL_ADDRESS } from '../../src/utils/constants'
// import { checkOrder } from '../src/utils/check'

import { orderFromJSON, transferFromERC1155 } from '../../src/utils'
import { Asset, ElementSchemaName, UnsignedOrder, checkOrder } from '../../src'
import { UnhashedOrder } from '../../src/types'

let erc721Order = {
  exchange: '0xb328610a54a438c80ee6103f8679d75d6c0e20ab',
  maker: '0xea199722372dea9df458dbb56be7721af117a9bc',
  taker: '0x0000000000000000000000000000000000000000',
  makerRelayerFee: '250',
  takerRelayerFee: '0',
  makerProtocolFee: '0',
  takerProtocolFee: '0',
  makerReferrerFee: '0',
  feeMethod: 1,
  feeRecipient: '0x23dc06f10dc382c7c9d4a1e992b95841e4f67792',
  side: 1,
  saleKind: 0,
  target: '0x371baf4c8aab700a53cfe3e35ca8ee2705b3c553',
  howToCall: 0,
  dataToCall:
    '0x23b872dd000000000000000000000000ea199722372dea9df458dbb56be7721af117a9bc00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000009',
  replacementPattern:
    '0x000000000000000000000000000000000000000000000000000000000000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000000000000000000000000000000000000',
  staticTarget: '0x0000000000000000000000000000000000000000',
  staticExtradata: '0x',
  paymentToken: '0x0000000000000000000000000000000000000000',
  quantity: '1',
  basePrice: '1000000000000000000',
  extra: '0',
  listingTime: '1625042889',
  expirationTime: '0',
  salt: '70775702614150182654105130483950714303871025442717526926027916423846505541902',
  metadata: {
    asset: {
      id: '9',
      address: '0x371baf4c8aab700a53cfe3e35ca8ee2705b3c553'
    },
    schema: 'ERC721',
    version: 2
  },
  v: 27,
  r: '0xaf3529ef897c3de9605342f4ea35ae893a467678a30090b304fc4d8e269bf9a6',
  s: '0x777870a0f1c1ee283ee6aee04dfa2c1ccbfee1608609f44c1a33a2ebbcab7f56',
  hash: '0xd85eea17a9cb5c33bd1fde82cfadc07d5ae91257c7df4b116e201e22e64aa8d0',
  version: 0
}
;(async () => {
  let base = new Base()
  await base.init()
  try {
    // @ts-ignore
    let check = await checkOrder(base.contracts, orderFromJSON(erc721Order))
    console.log(check)
    // await checkOrder(base.contracts, _order)
  } catch (e) {
    console.log(e)
  }
  return
})()
