import { BigNumber } from './constants'
import { ElementError, Network, schemas } from '../index'
import { tokens } from '../schema/tokens'
import { Schema } from '../schema/types'
import { ECSignature, UnhashedOrder, UnsignedOrder } from '../types'

// import { signOrderHash } from './makeOrder'

export function toBaseUnitAmount(amount: BigNumber, decimals: number): BigNumber {
  const unit = new BigNumber(10).pow(decimals)
  return amount.times(unit).integerValue()
}

export function makeBigNumber(arg: number | string | BigNumber): BigNumber {
  // Zero sometimes returned as 0x from contracts
  if (arg === '0x') {
    arg = 0
  }
  // fix "new BigNumber() number type has more than 15 significant digits"
  arg = arg.toString()
  return new BigNumber(arg)
}

export async function web3Sign(web3: any, msg: string, account: string): Promise<string> {
  // eslint-disable-next-line no-useless-catch
  try {
    let signatureRes
    // console.log('web3Sign', msg)
    if (typeof window === 'undefined') {
      return web3.eth.sign(msg, account)
    }

    if (web3.eth.accounts.wallet.length > 0) {
      return web3.eth.sign(msg, account)
    }

    if (web3.eth.defaultAccount.toLowerCase() == account.toLowerCase()) {
      signatureRes = await web3.eth.personal.sign(msg, account)
    } else {
      throw new ElementError({
        code: '1000',
        message: 'web3.eth.defaultAccount and maker not equal'
      })
    }
    return signatureRes
  } catch (error) {
    throw error
  }
}

// 登陆签名
export async function elementSignInSign(
  walletProvider: any,
  nonce: number,
  account: string
): Promise<{ message: string; signature: string }> {
  const message = `Welcome to Element!
   \nClick "Sign" to sign in. No password needed!
   \nI accept the Element Terms of Service: \n https://element.market/tos
   \nWallet address:\n${account}
   \nNonce:\n${nonce}`
  const signature = await web3Sign(walletProvider, message, account)
  return { message, signature }
}

export async function getAccountBalance(web3: any, account: string, erc20?: any): Promise<any> {
  const ethBal: number = await web3.eth.getBalance(account, 'latest').catch((error: any) => {
    const stack = error.message || JSON.stringify(error)
    throw new ElementError({
      code: '2003',
      context: { funcName: 'getAccountBalance.getBalance ', stack }
    })
  })
  let erc20Bal = 0
  if (erc20) {
    erc20Bal = await erc20.methods
      .balanceOf(account)
      .call()
      .catch((error: any) => {
        const stack = error.message || JSON.stringify(error)
        throw new ElementError({
          code: '2002',
          context: { funcName: 'getAccountBalance.balanceOf ', stack }
        })
      })
  }
  return { ethBal: Number(ethBal), erc20Bal: Number(erc20Bal) }
}

export async function getTokenIDOwner(elementAssetContract: any, tokenId: any): Promise<string> {
  // token id 的 creator
  // let exists = await elementAssetContract.methods.exists(tokenId).call()
  return elementAssetContract.methods.creator(tokenId).call()
}

export function getSchemaList(network: Network, schemaName?: string): Array<Schema<any>> {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let schemaList = schemas[network]
  if (!schemaList) {
    // throw new Error(
    //   `Trading for this Network (${network}) is not yet supported. Please contact us or check back later!`
    // )
    throw new ElementError({ code: '1206', context: { assetType: schemaName } })
  }
  if (schemaName) {
    schemaList = schemaList.filter((val: Schema<any>) => val.name === schemaName)
  }
  if (schemaList.length === 0) {
    throw new ElementError({ code: '1206', context: { assetType: schemaName } })
  }
  return schemaList
}

export function hashOrder(web3: any, order: UnhashedOrder): string {
  return web3.utils
    .soliditySha3(
      { type: 'address', value: order.exchange },
      { type: 'address', value: order.maker },
      { type: 'address', value: order.taker },
      { type: 'uint', value: order.makerRelayerFee },
      { type: 'uint', value: order.takerRelayerFee },
      { type: 'uint', value: order.takerProtocolFee },
      { type: 'uint', value: order.takerProtocolFee },
      { type: 'address', value: order.feeRecipient },
      { type: 'uint8', value: order.feeMethod },
      { type: 'uint8', value: order.side },
      { type: 'uint8', value: order.saleKind },
      { type: 'address', value: order.target },
      { type: 'uint8', value: order.howToCall },
      { type: 'bytes', value: order.dataToCall },
      { type: 'bytes', value: order.replacementPattern },
      { type: 'address', value: order.staticTarget },
      { type: 'bytes', value: order.staticExtradata },
      { type: 'address', value: order.paymentToken },
      { type: 'uint', value: order.basePrice },
      { type: 'uint', value: order.extra },
      { type: 'uint', value: order.listingTime },
      { type: 'uint', value: order.expirationTime },
      { type: 'uint', value: order.salt }
    )
    .toString('hex')
}

export function orderParamsEncode(order: UnhashedOrder): Array<any> {
  const orderParamKeys = [
    'exchange',
    'maker',
    'taker',
    'makerRelayerFee',
    'takerRelayerFee',
    'makerProtocolFee',
    'takerProtocolFee',
    'feeRecipient',
    'feeMethod',
    'side',
    'saleKind',
    'target',
    'howToCall',
    'dataToCall',
    'replacementPattern',
    'staticTarget',
    'staticExtradata',
    'paymentToken',
    'basePrice',
    'extra',
    'listingTime',
    'expirationTime',
    'salt'
  ]
  const orerParamValueArray = []
  for (const key of orderParamKeys) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    let val = order[key]
    if (val === undefined) {
      console.log('orderParamsEncode key undefined', key)
      continue
    }
    if (BigNumber.isBigNumber(val)) {
      val = val.toString()
    }

    orerParamValueArray.push(val)
  }
  return orerParamValueArray
}

export function orderSigEncode(order: ECSignature): Array<any> {
  const orderSigKeys = ['v', 'r', 's']
  const orderSigValueArray = []
  for (const key of orderSigKeys) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (order[key] === undefined) {
      console.log('orderSigEncode key undefined', key)
      continue
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    orderSigValueArray.push(order[key])
  }
  return orderSigValueArray
}

export function getTokenList(network: Network, { symbol, address }: { symbol?: string; address?: string }): Array<any> {
  const payTokens = tokens[network]
  if (symbol) {
    return [payTokens.canonicalWrappedEther, ...payTokens.otherTokens].filter(
      (x: any) => x.symbol.toLowerCase() === symbol.toLowerCase()
    )
  }

  if (address) {
    return [payTokens.canonicalWrappedEther, ...payTokens.otherTokens].filter(
      (x: any) => x.address.toLowerCase() === address.toLowerCase()
    )
  }

  return [payTokens.canonicalWrappedEther, ...payTokens.otherTokens]
}
