import BigNumber from 'bignumber.js'
import {WyvernProtocol} from 'wyvern-js'
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
    NULL_BLOCK_HASH,
    OPENSEA_FEE_RECIPIENT
} from '../constants'

import { ERC1155 } from '../abi/contracts'
import {proxyABI} from '../abi/Proxy'
// import Web3 from "web3";

export {
    WyvernProtocol
}

enum AbiType {
    Function = 'function',
    Constructor = 'constructor',
    Event = 'event',
    Fallback = 'fallback',
}

interface CallTxDataBase {
    to?: string;
    value?: number | string | BigNumber;
    gas?: number | string | BigNumber;
    gasPrice?: number | string | BigNumber;
    data?: string;
    nonce?: number;
}

interface TxData extends CallTxDataBase {
    from: string;
}

/**
 * Estimates the price of an order
 * @param order The order to estimate price on
 * @param secondsToBacktrack The number of seconds to subtract on current time,
 *  to fix race conditions
 * @param shouldRoundUp Whether to round up fractional wei
 */
export function estimateCurrentPrice(order: Order, secondsToBacktrack = 30, shouldRoundUp = true) {
    let { basePrice, listingTime, expirationTime, extra } = order
    const { side, takerRelayerFee, saleKind } = order

    const now = new BigNumber(Math.round(Date.now() / 1000)).minus(secondsToBacktrack)
    basePrice = new BigNumber(basePrice)
    listingTime = new BigNumber(listingTime)
    expirationTime = new BigNumber(expirationTime)
    extra = new BigNumber(extra)

    let exactPrice = basePrice

    if (saleKind === SaleKind.FixedPrice) {
        // Do nothing, price is correct
    } else if (saleKind === SaleKind.DutchAuction) {
        const diff = extra.times(now.minus(listingTime))
            .dividedBy(expirationTime.minus(listingTime))

        exactPrice = side == OrderSide.Sell
            /* Sell-side - start price: basePrice. End price: basePrice - extra. */
            ? basePrice.minus(diff)
            /* Buy-side - start price: basePrice. End price: basePrice + extra. */
            : basePrice.plus(diff)
    }

    // Add taker fee only for buyers
    if (side === OrderSide.Sell && !order.waitingForBestCounterOrder) {
        // Buyer fee increases sale price
        exactPrice = exactPrice.times(+takerRelayerFee / INVERSE_BASIS_POINT + 1)
    }

    return shouldRoundUp ? exactPrice.ceil() : exactPrice
}


/**
 * Delay using setTimeout
 * @param ms milliseconds to wait
 */
export async function delay(ms: number) {
    return new Promise(res => setTimeout(res, ms))
}

/**
 * Estimate Gas usage for a transaction
 * @param web3 Web3 instance
 * @param from address sending transaction
 * @param to destination contract address
 * @param data data to send to contract
 * @param value value in ETH to send with data
 */
export async function estimateGas(
    web3: any,
    {from, to, data, value = 0 }:  TxData
): Promise<number> {

    const amount = await promisify<number>(c => web3.eth.estimateGas({
        from,
        to,
        value,
        data,
    }, c))

    return amount
}

interface Web3Transaction {
    hash: string;
    nonce: number;
    blockHash: string | null;
    blockNumber: number | null;
    transactionIndex: number | null;
    from: string;
    to: string | null;
    value: BigNumber;
    gasPrice: BigNumber;
    gas: number;
    input: string;
}

interface TransactionReceipt {
    blockHash: string;
    blockNumber: number;
    transactionHash: string;
    transactionIndex: number;
    from: string;
    to: string;
    status: null | string | 0 | 1;
    cumulativeGasUsed: number;
    gasUsed: number;
    contractAddress: string | null;
    logs: LogEntry[];
}

interface LogEntry {
    logIndex: number | null;
    transactionIndex: number | null;
    transactionHash: string;
    blockHash: string | null;
    blockNumber: number | null;
    address: string;
    data: string;
    topics: string[];
}

// export type TxnCallback = (result: boolean) => void


const track = (web3: any, txHash: string, onFinalized: TxnCallback) => {
    if (txCallbacks[txHash]) {
        txCallbacks[txHash].push(onFinalized)
    } else {
        txCallbacks[txHash] = [onFinalized]
        const poll = async () => {
            const tx = await promisify< Web3Transaction>(c => web3.eth.getTransaction(txHash, c))
            if (tx && tx.blockHash && tx.blockHash !== NULL_BLOCK_HASH) {
                const receipt = await promisify< TransactionReceipt | null>(c => web3.eth.getTransactionReceipt(txHash, c))
                if (!receipt) {
                    // Hack: assume success if no receipt
                    console.warn('No receipt found for ', txHash)
                }
                const status = receipt
                    ? parseInt((receipt.status || "0").toString()) == 1
                    : true
                txCallbacks[txHash].map(f => f(status))
                delete txCallbacks[txHash]
            } else {
                setTimeout(poll, 1000)
            }
        }
        poll().catch()
    }
}




/**
 * Send a transaction to the blockchain and optionally confirm it
 * @param web3 Web3 instance
 * @param param0 __namedParameters
 * @param from address sending transaction
 * @param to destination contract address
 * @param data data to send to contract
 * @param gasPrice gas price to use. If unspecified, uses web3 default (mean gas price)
 * @param value value in ETH to send with data. Defaults to 0
 * @param onError callback when user denies transaction
 */
export async function sendRawTransaction(
    web3: any,
    {from, to, data, gasPrice, value = 0, gas}: TxData,
    onError: (error: Error) => void
): Promise<string> {

    if (gas == null) {
        // This gas cannot be increased due to an ethjs error
        gas = await estimateGas(web3, { from, to, data, value })
    }

    try {
        const txHashRes = await promisify<string>(c => web3.eth.sendTransaction({
            from,
            to,
            value,
            data,
            gas,
            gasPrice
        }, c))
        return txHashRes.toString()

    } catch (error) {

        onError(error)
        throw error
    }
}

export const confirmTransaction = async (web3: any, txHash: string) => {
    return new Promise((resolve, reject) => {
        track(web3, txHash, (didSucceed: boolean) => {
            if (didSucceed) {
                resolve("Transaction complete!")
            } else {
                reject(new Error(`Transaction failed :( You might have already completed this action. See more on the mainnet at etherscan.io/tx/${txHash}`))
            }
        })
    })
}

/**
 * Get mean gas price for sending a txn, in wei
 * @param web3 Web3 instance
 */
export async function getCurrentGasPrice(web3: any): Promise<BigNumber> {
    const meanGas = await promisify<BigNumber>(c => web3.eth.getGasPrice(c))
    return meanGas
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

const SCHEMA_NAME_TO_ASSET_CONTRACT_TYPE: { [key in WyvernSchemaName]: AssetContractType } = {
    [WyvernSchemaName.ERC721]: AssetContractType.NonFungible,
    [WyvernSchemaName.ERC1155]: AssetContractType.SemiFungible,
    [WyvernSchemaName.ERC20]: AssetContractType.Fungible,
    [WyvernSchemaName.LegacyEnjin]: AssetContractType.SemiFungible,
    [WyvernSchemaName.ENSShortNameAuction]: AssetContractType.NonFungible,
}

// OTHER

const txCallbacks: { [key: string]: TxnCallback[] } = {}

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
            if (err) {
                reject(err)
            }
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
        paymentToken: assetEvent.payment_token ? tokenFromJSON(assetEvent.payment_token) : null,
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

/**
 * Get the non-prefixed hash for the order
 * (Fixes a Wyvern typescript issue and casing issue)
 * @param order order to hash
 */
export function getOrderHash(order: UnhashedOrder) {
    const orderWithStringTypes = {
        ...order,
        maker: order.maker.toLowerCase(),
        taker: order.taker.toLowerCase(),
        feeRecipient: order.feeRecipient.toLowerCase(),
        side: order.side.toString(),
        saleKind: order.saleKind.toString(),
        howToCall: order.howToCall.toString(),
        feeMethod: order.feeMethod.toString()
    }
    return WyvernProtocol.getOrderHashHex(orderWithStringTypes as any)
}

/**
 * Validates that an address exists, isn't null, and is properly
 * formatted for Wyvern and OpenSea
 * @param address input address
 */
export function validateAndFormatWalletAddress(web3: any, address: string): string {
    if (!address) {
        throw new Error('No wallet address found')
    }
    if (!web3.utils.isAddress(address)) {
        throw new Error('Invalid wallet address')
    }
    if (address == NULL_ADDRESS) {
        throw new Error('Wallet cannot be the null address')
    }
    return address.toLowerCase()
}

/**
 * Get the Wyvern representation of a fungible asset
 * @param schema The WyvernSchema needed to access this asset
 * @param asset The asset to trade
 * @param quantity The number of items to trade
 */
export function getWyvernAsset(
    schema: Schema<WyvernAsset>,
    asset: Asset,
    quantity = new BigNumber(1)
): WyvernAsset {

    const tokenId = asset.tokenId != null
        ? asset.tokenId.toString()
        : undefined

    return schema.assetFromFields({
        'ID': tokenId,
        'Quantity': quantity.toString(),
        'Address': asset.tokenAddress.toLowerCase(),
        'Name': asset.name
    })
}

/**
 * Checks whether a given address contains any code
 * @param web3 Web3 instance
 * @param address input address
 */
export async function isContractAddress(web3: any, address: string
): Promise<boolean> {
    const code = await promisify<string>(c => web3.eth.getCode(address, c))
    return code !== '0x'
}

/**
 * Call a method on a contract, sending arbitrary data and
 * handling Parity errors. Returns '0x' if error.
 * @param web3 Web3 instance
 * @param param0 __namedParameters
 * @param from address sending call
 * @param to destination contract address
 * @param data data to send to contract
 * @param onError callback when user denies transaction
 */
export async function rawCall(
    web3: any,
    { from, to, data }:any,
    onError?: (error: Error) => void
): Promise<string> {

    try {
        const result = await promisify<string>(c => web3.eth.call({
            from,
            to,
            data
        }, c))
        return result

    } catch (error) {
        // Probably method not found, and web3 is a Parity node
        if (onError) {
            onError(error)
        }
        // Backwards compatibility with Geth nodes
        return '0x'
    }
}

/**
 * Get current transfer fees for an asset
 * @param web3 Web3 instance
 * @param asset The asset to check for transfer fees
 */
export async function getTransferFeeSettings(
    web3: any,
    { asset, accountAddress }: {
        asset: Asset;
        accountAddress?: string;
    }
) {
    let transferFee: BigNumber | undefined
    let transferFeeTokenAddress: string | undefined

    if (asset.tokenAddress.toLowerCase() == ENJIN_ADDRESS.toLowerCase()) {
        // Enjin asset
        const feeContract = web3.eth.contract(ERC1155 as any).at(asset.tokenAddress)

        const params = await promisifyCall<any[]>(c => feeContract.transferSettings(
            asset.tokenId,
            { from: accountAddress },
            c)
        )
        if (params) {
            transferFee = makeBigNumber(params[3])
            if (params[2] == 0) {
                transferFeeTokenAddress = ENJIN_COIN_ADDRESS
            }
        }
    }
    return { transferFee, transferFeeTokenAddress }
}

