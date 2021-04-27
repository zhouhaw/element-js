import * as Web3 from 'web3'
import {WyvernProtocol} from 'wyvern-js'
import * as WyvernSchemas from 'wyvern-schemas'
import {Schema} from 'wyvern-schemas/dist/types'
import {
    Network, Asset, Order, UnhashedOrder,
    UnsignedOrder,OpenSeaAsset,
    WyvernSchemaName, OpenSeaAPIConfig
} from './types'
import {
    validateAndFormatWalletAddress,
    makeBigNumber, getOrderHash,
    getWyvernAsset
} from './utils/utils'

import {
    MAINNET_PROVIDER_URL, RINKEBY_PROVIDER_URL,
    NULL_ADDRESS
} from './constants'

export class OpenSeaPort {

    // Logger function to use when debugging
    public logger: (arg: string) => void
    public web3: Web3

    private _networkName: Network
    private _wyvernProtocol: WyvernProtocol
    private _wyvernProtocolReadOnly: WyvernProtocol

    /**
     * Your very own seaport.
     * Create a new instance of OpenSeaJS.
     * @param provider Web3 Provider to use for transactions. For example:
     *  `const provider = new Web3.providers.HttpProvider('https://mainnet.infura.io')`
     * @param apiConfig configuration options, including `networkName`
     * @param logger logger, optional, a function that will be called with debugging
     *  information
     */
    constructor(provider: Web3.Provider, apiConfig: OpenSeaAPIConfig = {}, logger?: (arg: string) => void) {

        // API config
        apiConfig.networkName = apiConfig.networkName || Network.Main
        apiConfig.gasPrice = apiConfig.gasPrice || makeBigNumber(300000)


        this._networkName = apiConfig.networkName

        const readonlyProvider = new Web3.providers.HttpProvider(this._networkName == Network.Main ? MAINNET_PROVIDER_URL : RINKEBY_PROVIDER_URL)

        // Web3 Config
        this.web3 = new Web3(provider);


        // WyvernJS config
        this._wyvernProtocol = new WyvernProtocol(provider, {
            network: this._networkName,
            gasPrice: apiConfig.gasPrice,
        })

        // WyvernJS config for readonly (optimization for infura calls)
        this._wyvernProtocolReadOnly = new WyvernProtocol(readonlyProvider, {
            network: this._networkName,
            gasPrice: apiConfig.gasPrice,
        })

        // Debugging: default to nothing
        this.logger = logger || ((arg: string) => arg)
    }

    /**
     * Create a buy order to make an offer on an asset.
     * Will throw an 'Insufficient balance' error if the maker doesn't have enough W-ETH to make the offer.
     * If the user hasn't approved W-ETH access yet, this will emit `ApproveCurrency` before asking for approval.
     * @param param0 __namedParameters Object
     * @param asset The asset to trade
     * @param accountAddress Address of the maker's wallet
     * @param startAmount Value of the offer, in units of the payment token (or wrapped ETH if no payment token address specified)
     * @param quantity The number of assets to bid for (if fungible or semi-fungible). Defaults to 1. In units, not base units, e.g. not wei.
     * @param expirationTime Expiration time for the order, in seconds. An expiration time of 0 means "never expire"
     * @param paymentTokenAddress Optional address for using an ERC-20 token in the order. If unspecified, defaults to W-ETH
     * @param sellOrder Optional sell order (like an English auction) to ensure fee and schema compatibility
     * @param referrerAddress The optional address that referred the order
     */
    public async createBuyOrder(
        {asset, accountAddress, startAmount, quantity = 1, expirationTime = 0, paymentTokenAddress, sellOrder, referrerAddress}:
            {
                asset: Asset;
                accountAddress: string;
                startAmount: number;
                quantity?: number;
                expirationTime?: number;
                paymentTokenAddress?: string;
                sellOrder?: Order;
                referrerAddress?: string;
            }
    ): Promise<Order> {

        paymentTokenAddress = paymentTokenAddress || WyvernSchemas.tokens[this._networkName].canonicalWrappedEther.address

        const order = await this._makeBuyOrder({
            asset,
            quantity,
            accountAddress,
            startAmount,
            expirationTime,
            paymentTokenAddress,
            extraBountyBasisPoints: 0,
            sellOrder,
            referrerAddress
        })

        // NOTE not in Wyvern exchange code:
        // frontend checks to make sure
        // token is approved and sufficiently available
        await this._buyOrderValidationAndApprovals({order, accountAddress})

        const hashedOrder = {
            ...order,
            hash: getOrderHash(order)
        }
        let signature
        try {
            signature = await this._authorizeOrder(hashedOrder)
        } catch (error) {
            console.error(error)
            throw new Error("You declined to authorize your offer")
        }

        const orderWithSignature = {
            ...hashedOrder,
            ...signature
        }
        return this.validateAndPostOrder(orderWithSignature)
    }

    public async _makeBuyOrder(
        {asset, quantity, accountAddress, startAmount, expirationTime = 0, paymentTokenAddress, extraBountyBasisPoints = 0, sellOrder, referrerAddress}:
            {
                asset: Asset;
                quantity: number;
                accountAddress: string;
                startAmount: number;
                expirationTime: number;
                paymentTokenAddress: string;
                extraBountyBasisPoints: number;
                sellOrder?: UnhashedOrder;
                referrerAddress?: string;
            }
    ): Promise<UnhashedOrder> {

        accountAddress = validateAndFormatWalletAddress(this.web3, accountAddress)
        const schema = this._getSchema(asset.schemaName)
        const quantityBN = WyvernProtocol.toBaseUnitAmount(makeBigNumber(quantity), asset.decimals || 0)
        const wyAsset = getWyvernAsset(schema, asset, quantityBN)

        const openSeaAsset: OpenSeaAsset = {}// await this.api.getAsset(asset)

        const taker = sellOrder
            ? sellOrder.maker
            : NULL_ADDRESS

        const {
            totalBuyerFeeBasisPoints,
            totalSellerFeeBasisPoints
        } = await this.computeFees({asset: openSeaAsset, extraBountyBasisPoints, side: OrderSide.Buy})

        const {
            makerRelayerFee,
            takerRelayerFee,
            makerProtocolFee,
            takerProtocolFee,
            makerReferrerFee,
            feeRecipient,
            feeMethod
        } = this._getBuyFeeParameters(totalBuyerFeeBasisPoints, totalSellerFeeBasisPoints, sellOrder)

        const {target, calldata, replacementPattern} = encodeBuy(schema, wyAsset, accountAddress)

        const {basePrice, extra, paymentToken} = await this._getPriceParameters(OrderSide.Buy, paymentTokenAddress, expirationTime, startAmount)
        const times = this._getTimeParameters(expirationTime)

        const {staticTarget, staticExtradata} = await this._getStaticCallTargetAndExtraData({
            asset: openSeaAsset,
            useTxnOriginStaticCall: false
        })

        return {
            exchange: WyvernProtocol.getExchangeContractAddress(this._networkName),
            maker: accountAddress,
            taker,
            quantity: quantityBN,
            makerRelayerFee,
            takerRelayerFee,
            makerProtocolFee,
            takerProtocolFee,
            makerReferrerFee,
            waitingForBestCounterOrder: false,
            feeMethod,
            feeRecipient,
            side: OrderSide.Buy,
            saleKind: SaleKind.FixedPrice,
            target,
            howToCall: HowToCall.Call,
            calldata,
            replacementPattern,
            staticTarget,
            staticExtradata,
            paymentToken,
            basePrice,
            extra,
            listingTime: times.listingTime,
            expirationTime: times.expirationTime,
            salt: WyvernProtocol.generatePseudoRandomSalt(),
            metadata: {
                asset: wyAsset,
                schema: schema.name as WyvernSchemaName,
                referrerAddress
            }
        }
    }

    // Throws
    public async _buyOrderValidationAndApprovals(
        {order, counterOrder, accountAddress}:
            { order: UnhashedOrder; counterOrder?: Order; accountAddress: string }
    ) {
        const tokenAddress = order.paymentToken

        if (tokenAddress != NULL_ADDRESS) {
            const balance = await this.getTokenBalance({accountAddress, tokenAddress})

            /* NOTE: no buy-side auctions for now, so sell.saleKind === 0 */
            let minimumAmount = makeBigNumber(order.basePrice)
            if (counterOrder) {
                minimumAmount = await this._getRequiredAmountForTakingSellOrder(counterOrder)
            }

            // Check WETH balance
            if (balance.toNumber() < minimumAmount.toNumber()) {
                if (tokenAddress == WyvernSchemas.tokens[this._networkName].canonicalWrappedEther.address) {
                    throw new Error('Insufficient balance. You may need to wrap Ether.')
                } else {
                    throw new Error('Insufficient balance.')
                }
            }

            // Check token approval
            // This can be done at a higher level to show UI
            await this.approveFungibleToken({accountAddress, tokenAddress, minimumAmount})
        }

        // Check order formation
        const buyValid = await this._wyvernProtocolReadOnly.wyvernExchange.validateOrderParameters_.callAsync([order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken],
            [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt],
            order.feeMethod,
            order.side,
            order.saleKind,
            order.howToCall,
            order.calldata,
            order.replacementPattern,
            order.staticExtradata,
            {from: accountAddress})
        if (!buyValid) {
            console.error(order)
            throw new Error(`Failed to validate buy order parameters. Make sure you're on the right network!`)
        }
    }

    private async _authorizeOrder(
        order: UnsignedOrder
    ): Promise<ECSignature | null> {
        const message = order.hash
        const signerAddress = order.maker

        this._dispatch(EventType.CreateOrder, {order, accountAddress: order.maker})

        const makerIsSmartContract = await isContractAddress(this.web3, signerAddress)

        try {
            if (makerIsSmartContract) {
                // The web3 provider is probably a smart contract wallet.
                // Fallback to on-chain approval.
                await this._approveOrder(order)
                return null
            } else {
                return await personalSignAsync(this.web3, message, signerAddress)
            }
        } catch (error) {
            this._dispatch(EventType.OrderDenied, {order, accountAddress: signerAddress})
            throw error
        }
    }

    /**
     * Validate and post an order to the OpenSea orderbook.
     * @param order The order to post. Can either be signed by the maker or pre-approved on the Wyvern contract using approveOrder. See https://github.com/ProjectWyvern/wyvern-ethereum/blob/master/contracts/exchange/Exchange.sol#L178
     * @returns The order as stored by the orderbook
     */
    public async validateAndPostOrder(order: Order): Promise<Order> {
        const hash = await this._wyvernProtocolReadOnly.wyvernExchange.hashOrder_.callAsync(
            [order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken],
            [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt],
            order.feeMethod,
            order.side,
            order.saleKind,
            order.howToCall,
            order.calldata,
            order.replacementPattern,
            order.staticExtradata)

        if (hash !== order.hash) {
            console.error(order)
            throw new Error(`Order couldn't be validated by the exchange due to a hash mismatch. Make sure your wallet is on the right network!`)
        }
        this.logger('Order hashes match')

        // Validation is called server-side
        const confirmedOrder = order //await this.api.postOrder(orderToJSON(order))
        return confirmedOrder
    }

    private _getSchema(schemaName?: WyvernSchemaName): Schema<any> {
        const schemaName_ = schemaName || WyvernSchemaName.ERC721
        const schema = WyvernSchemas.schemas[this._networkName].filter(s => s.name == schemaName_)[0]

        if (!schema) {
            throw new Error(`Trading for this asset (${schemaName_}) is not yet supported. Please contact us or check back later!`)
        }
        return schema
    }

    /**
     * Compute the fees for an order
     * @param param0 __namedParameters
     * @param asset Asset to use for fees. May be blank ONLY for multi-collection bundles.
     * @param side The side of the order (buy or sell)
     * @param accountAddress The account to check fees for (useful if fees differ by account, like transfer fees)
     * @param isPrivate Whether the order is private or not (known taker)
     * @param extraBountyBasisPoints The basis points to add for the bounty. Will throw if it exceeds the assets' contract's OpenSea fee.
     */
    public async computeFees(
        { asset, side, accountAddress, isPrivate = false, extraBountyBasisPoints = 0 }:
            { asset?: OpenSeaAsset;
                side: OrderSide;
                accountAddress?: string;
                isPrivate?: boolean;
                extraBountyBasisPoints?: number }
    ): Promise<ComputedFees> {

        let openseaBuyerFeeBasisPoints = DEFAULT_BUYER_FEE_BASIS_POINTS
        let openseaSellerFeeBasisPoints = DEFAULT_SELLER_FEE_BASIS_POINTS
        let devBuyerFeeBasisPoints = 0
        let devSellerFeeBasisPoints = 0
        let transferFee = makeBigNumber(0)
        let transferFeeTokenAddress = null
        let maxTotalBountyBPS = DEFAULT_MAX_BOUNTY

        if (asset) {
            openseaBuyerFeeBasisPoints = +asset.collection.openseaBuyerFeeBasisPoints
            openseaSellerFeeBasisPoints = +asset.collection.openseaSellerFeeBasisPoints
            devBuyerFeeBasisPoints = +asset.collection.devBuyerFeeBasisPoints
            devSellerFeeBasisPoints = +asset.collection.devSellerFeeBasisPoints

            maxTotalBountyBPS = openseaSellerFeeBasisPoints
        }

        // Compute transferFrom fees
        if (side == OrderSide.Sell && asset) {
            // Server-side knowledge
            transferFee = asset.transferFee
                ? makeBigNumber(asset.transferFee)
                : transferFee
            transferFeeTokenAddress = asset.transferFeePaymentToken
                ? asset.transferFeePaymentToken.address
                : transferFeeTokenAddress

            try {
                // web3 call to update it
                const result = await getTransferFeeSettings(this.web3, { asset, accountAddress })
                transferFee = result.transferFee != null ? result.transferFee : transferFee
                transferFeeTokenAddress = result.transferFeeTokenAddress || transferFeeTokenAddress
            } catch (error) {
                // Use server defaults
                console.error(error)
            }
        }

        // Compute bounty
        let sellerBountyBasisPoints = side == OrderSide.Sell
            ? extraBountyBasisPoints
            : 0

        // Check that bounty is in range of the opensea fee
        const bountyTooLarge = sellerBountyBasisPoints + OPENSEA_SELLER_BOUNTY_BASIS_POINTS > maxTotalBountyBPS
        if (sellerBountyBasisPoints > 0 && bountyTooLarge) {
            let errorMessage = `Total bounty exceeds the maximum for this asset type (${maxTotalBountyBPS / 100}%).`
            if (maxTotalBountyBPS >= OPENSEA_SELLER_BOUNTY_BASIS_POINTS) {
                errorMessage += ` Remember that OpenSea will add ${OPENSEA_SELLER_BOUNTY_BASIS_POINTS / 100}% for referrers with OpenSea accounts!`
            }
            throw new Error(errorMessage)
        }

        // Remove fees for private orders
        if (isPrivate) {
            openseaBuyerFeeBasisPoints = 0
            openseaSellerFeeBasisPoints = 0
            devBuyerFeeBasisPoints = 0
            devSellerFeeBasisPoints = 0
            sellerBountyBasisPoints = 0
        }

        return {
            totalBuyerFeeBasisPoints: openseaBuyerFeeBasisPoints + devBuyerFeeBasisPoints,
            totalSellerFeeBasisPoints: openseaSellerFeeBasisPoints + devSellerFeeBasisPoints,
            openseaBuyerFeeBasisPoints,
            openseaSellerFeeBasisPoints,
            devBuyerFeeBasisPoints,
            devSellerFeeBasisPoints,
            sellerBountyBasisPoints,
            transferFee,
            transferFeeTokenAddress,
        }
    }

    public _getBuyFeeParameters(totalBuyerFeeBasisPoints: number, totalSellerFeeBasisPoints: number, sellOrder?: UnhashedOrder) {

        this._validateFees(totalBuyerFeeBasisPoints, totalSellerFeeBasisPoints)

        let makerRelayerFee
        let takerRelayerFee

        if (sellOrder) {
            // Use the sell order's fees to ensure compatiblity and force the order
            // to only be acceptable by the sell order maker.
            // Swap maker/taker depending on whether it's an English auction (taker)
            // TODO add extraBountyBasisPoints when making bidder bounties
            makerRelayerFee = sellOrder.waitingForBestCounterOrder
                ? makeBigNumber(sellOrder.makerRelayerFee)
                : makeBigNumber(sellOrder.takerRelayerFee)
            takerRelayerFee = sellOrder.waitingForBestCounterOrder
                ? makeBigNumber(sellOrder.takerRelayerFee)
                : makeBigNumber(sellOrder.makerRelayerFee)
        } else {
            makerRelayerFee = makeBigNumber(totalBuyerFeeBasisPoints)
            takerRelayerFee = makeBigNumber(totalSellerFeeBasisPoints)
        }

        return {
            makerRelayerFee,
            takerRelayerFee,
            makerProtocolFee: makeBigNumber(0),
            takerProtocolFee: makeBigNumber(0),
            makerReferrerFee: makeBigNumber(0), // TODO use buyerBountyBPS
            feeRecipient: OPENSEA_FEE_RECIPIENT,
            feeMethod: FeeMethod.SplitFee
        }
    }

}