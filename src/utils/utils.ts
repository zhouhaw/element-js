import BigNumber from 'bignumber.js'
import { WyvernProtocol } from 'wyvern-js'
import {
  AnnotatedFunctionABI,
  FunctionInputKind,
  FunctionOutputKind,
  Schema,
  StateMutability
} from 'wyvern-schemas/dist/types' 
import {
  Asset,
  AssetContractType,
  AssetEvent,
  ECSignature,
  OpenSeaAccount,
  OpenSeaAsset,
  OpenSeaAssetBundle,
  OpenSeaAssetContract,
  OpenSeaCollection,
  OpenSeaFungibleToken,
  OpenSeaTraitStats, OpenSeaUser,
  Order,
  OrderJSON,
  OrderSide,
  SaleKind,
  Transaction,
  TxnCallback,
  UnhashedOrder,
  UnsignedOrder,
  Web3Callback,
  WyvernAsset,
  WyvernBundle,
  WyvernFTAsset,
  WyvernNFTAsset,
  WyvernSchemaName
} from '../types'
import {
  ENJIN_ADDRESS,
  ENJIN_COIN_ADDRESS,
  INVERSE_BASIS_POINT,
  NULL_ADDRESS,
  NULL_BLOCK_HASH
} from '../constants'
import { proxyABI } from '../abi/Proxy'

export {
  WyvernProtocol
}

enum AbiType {
  Function = 'function',
  Constructor = 'constructor',
  Event = 'event',
  Fallback = 'fallback',
}
/**
 * Delay using setTimeout
 * @param ms milliseconds to wait
 */
export async function delay(ms: number) {
  return new Promise(res => setTimeout(res, ms))
}


export const annotateERC721TransferABI = (asset: WyvernNFTAsset): AnnotatedFunctionABI => ({
  "constant": false,
  "inputs": [
    {
      "name": "_to",
      "type": "address",
      "kind": FunctionInputKind.Replaceable
    },
    {
      "name": "_tokenId",
      "type": "uint256",
      "kind": FunctionInputKind.Asset,
      "value": asset.id
    }
  ],
  "target": asset.address,
  "name": "transfer",
  "outputs": [],
  "payable": false,
  "stateMutability": StateMutability.Nonpayable,
  "type": AbiType.Function
})

export const annotateERC20TransferABI = (asset: WyvernFTAsset): AnnotatedFunctionABI => ({
  "constant": false,
  "inputs": [
    {
      "name": "_to",
      "type": "address",
      "kind": FunctionInputKind.Replaceable
    },
    {
      "name": "_amount",
      "type": "uint256",
      "kind": FunctionInputKind.Count,
      "value": asset.quantity
    }
  ],
  "target": asset.address,
  "name": "transfer",
  "outputs": [
    {
      "name": "success",
      "type": "bool",
      "kind": FunctionOutputKind.Other
    }
  ],
  "payable": false,
  "stateMutability": StateMutability.Nonpayable,
  "type": AbiType.Function
})

const SCHEMA_NAME_TO_ASSET_CONTRACT_TYPE: {[key in WyvernSchemaName]: AssetContractType} = {
  [WyvernSchemaName.ERC721]: AssetContractType.NonFungible,
  [WyvernSchemaName.ERC1155]: AssetContractType.SemiFungible,
  [WyvernSchemaName.ERC20]: AssetContractType.Fungible,
  [WyvernSchemaName.LegacyEnjin]: AssetContractType.SemiFungible,
  [WyvernSchemaName.ENSShortNameAuction]: AssetContractType.NonFungible,
}

// OTHER

const txCallbacks: {[key: string]: TxnCallback[]} = {}

/**
 * Promisify a callback-syntax web3 function
 * @param inner callback function that accepts a Web3 callback function and passes
 * it to the Web3 function
 */
async function promisify<T>(
    inner: (fn: Web3Callback<T>) => void
  ) {
  return new Promise<T>((resolve, reject) =>
    inner((err, res) => {
      if (err) { reject(err) }
      resolve(res)
    })
  )
}

/**
 * Promisify a call a method on a contract,
 * handling Parity errors. Returns '0x' if error.
 * Note that if T is not "string", this may return a falsey
 * value when the contract doesn't support the method (e.g. `isApprovedForAll`).
 * @param callback An anonymous function that takes a web3 callback
 * and returns a Web3 Contract's call result, e.g. `c => erc721.ownerOf(3, c)`
 * @param onError callback when user denies transaction
 */
export async function promisifyCall<T>(
    callback: (fn: Web3Callback<T>) => void,
    onError?: (error: Error) => void
  ): Promise<T | undefined> {

  try {

    const result: any = await promisify<T>(callback)
    if (result == '0x') {
      // Geth compatibility
      return undefined
    }
    return result as T

  } catch (error) {
    // Probably method not found, and web3 is a Parity node
    if (onError) {
      onError(error)
    } else {
      console.error(error)
    }
    return undefined
  }
}
 

export const assetFromJSON = (asset: any): OpenSeaAsset => {
  const isAnimated = asset.image_url && asset.image_url.endsWith('.gif')
  const isSvg = asset.image_url && asset.image_url.endsWith('.svg')
  const fromJSON: OpenSeaAsset = {
    tokenId: asset.token_id.toString(),
    tokenAddress: asset.asset_contract.address,
    name: asset.name,
    description: asset.description,
    owner: asset.owner,
    assetContract: assetContractFromJSON(asset.asset_contract),
    collection: collectionFromJSON(asset.collection),
    orders: asset.orders ? asset.orders.map(orderFromJSON) : null,
    sellOrders: asset.sell_orders ? asset.sell_orders.map(orderFromJSON) : null,
    buyOrders: asset.buy_orders ? asset.buy_orders.map(orderFromJSON) : null,

    isPresale: asset.is_presale,
    // Don't use previews if it's a special image
    imageUrl: isAnimated || isSvg
      ? asset.image_url
      : (asset.image_preview_url || asset.image_url),
    imagePreviewUrl: asset.image_preview_url,
    imageUrlOriginal: asset.image_original_url,
    imageUrlThumbnail: asset.image_thumbnail_url,

    externalLink: asset.external_link,
    openseaLink: asset.permalink,
    traits: asset.traits,
    numSales: asset.num_sales,
    lastSale: asset.last_sale ? assetEventFromJSON(asset.last_sale) : null,
    backgroundColor: asset.background_color ? `#${asset.background_color}` : null,

    transferFee: asset.transfer_fee
      ? makeBigNumber(asset.transfer_fee)
      : null,
    transferFeePaymentToken: asset.transfer_fee_payment_token
      ? tokenFromJSON(asset.transfer_fee_payment_token)
      : null,
  }
  // If orders were included, put them in sell/buy order groups
  if (fromJSON.orders && !fromJSON.sellOrders) {
    fromJSON.sellOrders = fromJSON.orders.filter(o => o.side == OrderSide.Sell)
  }
  if (fromJSON.orders && !fromJSON.buyOrders) {
    fromJSON.buyOrders = fromJSON.orders.filter(o => o.side == OrderSide.Buy)
  }
  return fromJSON
}

export const assetEventFromJSON = (assetEvent: any): AssetEvent => {
  return {
    eventType: assetEvent.event_type,
    eventTimestamp: assetEvent.event_timestamp,
    auctionType: assetEvent.auction_type,
    totalPrice: assetEvent.total_price,
    transaction: assetEvent.transaction ? transactionFromJSON(assetEvent.transaction) : null,
    paymentToken: assetEvent.payment_token ?  tokenFromJSON(assetEvent.payment_token) : null,
  }
}

export const transactionFromJSON = (transaction: any): Transaction => {
  return {
    fromAccount: accountFromJSON(transaction.from_account),
    toAccount: accountFromJSON(transaction.to_account),
    createdDate: new Date(`${transaction.created_date}Z`),
    modifiedDate: new Date(`${transaction.modified_date}Z`),
    transactionHash: transaction.transaction_hash,
    transactionIndex: transaction.transaction_index,
    blockNumber: transaction.block_number,
    blockHash: transaction.block_hash,
    timestamp: new Date(`${transaction.timestamp}Z`),
  }
}

export const accountFromJSON = (account: any): OpenSeaAccount => {
  return {
    address: account.address,
    config: account.config,
    profileImgUrl: account.profile_img_url,
    user: account.user ? userFromJSON(account.user) : null
  }
}

export const userFromJSON = (user: any): OpenSeaUser => {
  return {
    username: user.username
  }
}

export const assetBundleFromJSON = (asset_bundle: any): OpenSeaAssetBundle => {

  const fromJSON: OpenSeaAssetBundle = {
    maker: asset_bundle.maker,
    assets: asset_bundle.assets.map(assetFromJSON),
    assetContract: asset_bundle.asset_contract
      ? assetContractFromJSON(asset_bundle.asset_contract)
      : undefined,
    name: asset_bundle.name,
    slug: asset_bundle.slug,
    description: asset_bundle.description,
    externalLink: asset_bundle.external_link,
    permalink: asset_bundle.permalink,

    sellOrders: asset_bundle.sell_orders ? asset_bundle.sell_orders.map(orderFromJSON) : null
  }

  return fromJSON
}

export const assetContractFromJSON = (asset_contract: any): OpenSeaAssetContract => {
  return {
    name: asset_contract.name,
    description: asset_contract.description,
    type: asset_contract.asset_contract_type,
    schemaName: asset_contract.schema_name,
    address: asset_contract.address,
    tokenSymbol: asset_contract.symbol,
    buyerFeeBasisPoints: +asset_contract.buyer_fee_basis_points,
    sellerFeeBasisPoints: +asset_contract.seller_fee_basis_points,
    openseaBuyerFeeBasisPoints: +asset_contract.opensea_buyer_fee_basis_points,
    openseaSellerFeeBasisPoints: +asset_contract.opensea_seller_fee_basis_points,
    devBuyerFeeBasisPoints: +asset_contract.dev_buyer_fee_basis_points,
    devSellerFeeBasisPoints: +asset_contract.dev_seller_fee_basis_points,
    imageUrl: asset_contract.image_url,
    externalLink: asset_contract.external_link,
    wikiLink: asset_contract.wiki_link,
  }
}

export const collectionFromJSON = (collection: any): OpenSeaCollection => {
  const createdDate = new Date(`${collection.created_date}Z`)

  return {
    createdDate,
    name: collection.name,
    description: collection.description,
    slug: collection.slug,
    editors: collection.editors,
    hidden: collection.hidden,
    featured: collection.featured,
    featuredImageUrl: collection.featured_image_url,
    displayData: collection.display_data,
    paymentTokens: (collection.payment_tokens || []).map(tokenFromJSON),
    openseaBuyerFeeBasisPoints: +collection.opensea_buyer_fee_basis_points,
    openseaSellerFeeBasisPoints: +collection.opensea_seller_fee_basis_points,
    devBuyerFeeBasisPoints: +collection.dev_buyer_fee_basis_points,
    devSellerFeeBasisPoints: +collection.dev_seller_fee_basis_points,
    payoutAddress: collection.payout_address,
    imageUrl: collection.image_url,
    largeImageUrl: collection.large_image_url,
    stats: collection.stats,
    traitStats: collection.traits as OpenSeaTraitStats,
    externalLink: collection.external_url,
    wikiLink: collection.wiki_url,
  }
}

export const tokenFromJSON = (token: any): OpenSeaFungibleToken => {

  const fromJSON: OpenSeaFungibleToken = {
    name: token.name,
    symbol: token.symbol,
    decimals: token.decimals,
    address: token.address,
    imageUrl: token.image_url,
    ethPrice: token.eth_price,
    usdPrice: token.usd_price,
  }

  return fromJSON
}

export const orderFromJSON = (order: any): Order => {

  const createdDate = new Date(`${order.created_date}Z`)

  const fromJSON: Order = {
    hash: order.order_hash || order.hash,
    cancelledOrFinalized: order.cancelled || order.finalized,
    markedInvalid: order.marked_invalid,
    metadata: order.metadata,
    quantity: new BigNumber(order.quantity || 1),
    exchange: order.exchange,
    makerAccount: order.maker,
    takerAccount: order.taker,
    // Use string address to conform to Wyvern Order schema
    maker: order.maker.address,
    taker: order.taker.address,
    makerRelayerFee: new BigNumber(order.maker_relayer_fee),
    takerRelayerFee: new BigNumber(order.taker_relayer_fee),
    makerProtocolFee: new BigNumber(order.maker_protocol_fee),
    takerProtocolFee: new BigNumber(order.taker_protocol_fee),
    makerReferrerFee: new BigNumber(order.maker_referrer_fee || 0),
    waitingForBestCounterOrder: order.fee_recipient.address == NULL_ADDRESS,
    feeMethod: order.fee_method,
    feeRecipientAccount: order.fee_recipient,
    feeRecipient: order.fee_recipient.address,
    side: order.side,
    saleKind: order.sale_kind,
    target: order.target,
    howToCall: order.how_to_call,
    calldata: order.calldata,
    replacementPattern: order.replacement_pattern,
    staticTarget: order.static_target,
    staticExtradata: order.static_extradata,
    paymentToken: order.payment_token,
    basePrice: new BigNumber(order.base_price),
    extra: new BigNumber(order.extra),
    currentBounty: new BigNumber(order.current_bounty || 0),
    currentPrice: new BigNumber(order.current_price || 0),

    createdTime: new BigNumber(Math.round(createdDate.getTime() / 1000)),
    listingTime: new BigNumber(order.listing_time),
    expirationTime: new BigNumber(order.expiration_time),

    salt: new BigNumber(order.salt),
    v: parseInt(order.v),
    r: order.r,
    s: order.s,

    paymentTokenContract: order.payment_token_contract ? tokenFromJSON(order.payment_token_contract) : undefined,
    asset: order.asset ? assetFromJSON(order.asset) : undefined,
    assetBundle: order.asset_bundle ? assetBundleFromJSON(order.asset_bundle) : undefined,
  }

  // Use client-side price calc, to account for buyer fee (not added by server) and latency
  fromJSON.currentPrice = BigNumber.max()

  return fromJSON
}

/**
 * Convert an order to JSON, hashing it as well if necessary
 * @param order order (hashed or unhashed)
 */
export const orderToJSON = (order: Order): OrderJSON => {
  const asJSON: OrderJSON = {
    exchange: order.exchange.toLowerCase(),
    maker: order.maker.toLowerCase(),
    taker: order.taker.toLowerCase(),
    makerRelayerFee: order.makerRelayerFee.toString(),
    takerRelayerFee: order.takerRelayerFee.toString(),
    makerProtocolFee: order.makerProtocolFee.toString(),
    takerProtocolFee: order.takerProtocolFee.toString(),
    makerReferrerFee: order.makerReferrerFee.toString(),
    feeMethod: order.feeMethod,
    feeRecipient: order.feeRecipient.toLowerCase(),
    side: order.side,
    saleKind: order.saleKind,
    target: order.target.toLowerCase(),
    howToCall: order.howToCall,
    calldata: order.calldata,
    replacementPattern: order.replacementPattern,
    staticTarget: order.staticTarget.toLowerCase(),
    staticExtradata: order.staticExtradata,
    paymentToken: order.paymentToken.toLowerCase(),
    quantity: order.quantity.toString(),
    basePrice: order.basePrice.toString(),
    englishAuctionReservePrice: order.englishAuctionReservePrice ? order.englishAuctionReservePrice.toString() : undefined,
    extra: order.extra.toString(),
    createdTime: order.createdTime
      ? order.createdTime.toString()
      : undefined,
    listingTime: order.listingTime.toString(),
    expirationTime: order.expirationTime.toString(),
    salt: order.salt.toString(),

    metadata: order.metadata,

    v: order.v,
    r: order.r,
    s: order.s,

    hash: order.hash
  }
  return asJSON
}
 
 
/**
 * Special fixes for making BigNumbers using web3 results
 * @param arg An arg or the result of a web3 call to turn into a BigNumber
 */
export function makeBigNumber(arg: number | string | BigNumber): BigNumber {
  // Zero sometimes returned as 0x from contracts
  if (arg === '0x') {
    arg = 0
  }
  // fix "new BigNumber() number type has more than 15 significant digits"
  arg = arg.toString()
  return new BigNumber(arg)
}

