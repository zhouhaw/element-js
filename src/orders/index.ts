import * as Web3 from 'web3'
import {WyvernProtocol} from 'wyvern-js'
import * as WyvernSchemas from 'wyvern-schemas'
import {Schema} from 'wyvern-schemas/dist/types'
import { EventEmitter, EventSubscription } from 'fbemitter'
import { BigNumber } from 'bignumber.js'

import {
    Network, Asset, Order, UnhashedOrder,EventType,
    UnsignedOrder, OpenSeaAsset, OrderSide,
    WyvernSchemaName, OpenSeaAPIConfig,EventData
} from '../types'
import {  StaticCheckTxOrigin, StaticCheckCheezeWizards, StaticCheckDecentralandEstates,
    CheezeWizardsBasicTournament, DecentralandEstates, getMethod,ERC20 } from '../abi/contracts'
import {
    confirmTransaction,
    estimateCurrentPrice,
    sendRawTransaction,
    getCurrentGasPrice,
    validateAndFormatWalletAddress,
    makeBigNumber, getOrderHash,
    getWyvernAsset, orderToJSON,
    rawCall,
    promisifyCall,
    delay
} from '../utils/utils'

import {
    encodeAtomicizedTransfer,
    encodeProxyCall,
    encodeTransferCall,
    encodeCall,
    encodeBuy,
    encodeSell,
    encodeAtomicizedBuy,
    encodeAtomicizedSell
} from '../utils/schema'

import {
    CHEEZE_WIZARDS_BASIC_TOURNAMENT_ADDRESS,
    CHEEZE_WIZARDS_BASIC_TOURNAMENT_RINKEBY_ADDRESS,
    CHEEZE_WIZARDS_GUILD_ADDRESS,
    CHEEZE_WIZARDS_GUILD_RINKEBY_ADDRESS,
    CK_ADDRESS,
    CK_RINKEBY_ADDRESS,
    DECENTRALAND_ESTATE_ADDRESS,
    DEFAULT_BUYER_FEE_BASIS_POINTS,
    DEFAULT_GAS_INCREASE_FACTOR,
    DEFAULT_MAX_BOUNTY,
    DEFAULT_SELLER_FEE_BASIS_POINTS,
    DEFAULT_WRAPPED_NFT_LIQUIDATION_UNISWAP_SLIPPAGE_IN_BASIS_POINTS,
    INVERSE_BASIS_POINT, MAINNET_PROVIDER_URL,
    MIN_EXPIRATION_SECONDS, NULL_ADDRESS, NULL_BLOCK_HASH, OPENSEA_FEE_RECIPIENT,
    OPENSEA_SELLER_BOUNTY_BASIS_POINTS,
    ORDER_MATCHING_LATENCY_SECONDS, RINKEBY_PROVIDER_URL,
    SELL_ORDER_BATCH_SIZE,
    STATIC_CALL_CHEEZE_WIZARDS_ADDRESS,
    STATIC_CALL_CHEEZE_WIZARDS_RINKEBY_ADDRESS,
    STATIC_CALL_DECENTRALAND_ESTATES_ADDRESS,
    STATIC_CALL_TX_ORIGIN_ADDRESS,
    STATIC_CALL_TX_ORIGIN_RINKEBY_ADDRESS,
    UNISWAP_FACTORY_ADDRESS_MAINNET,
    UNISWAP_FACTORY_ADDRESS_RINKEBY,
    WRAPPED_NFT_FACTORY_ADDRESS_MAINNET,
    WRAPPED_NFT_FACTORY_ADDRESS_RINKEBY,
    WRAPPED_NFT_LIQUIDATION_PROXY_ADDRESS_MAINNET,
    WRAPPED_NFT_LIQUIDATION_PROXY_ADDRESS_RINKEBY,
    ENJIN_COIN_ADDRESS,
    MANA_ADDRESS,
} from '../constants'


export class OrderBook {
    public gasPriceAddition = new BigNumber(3)
    public web3: any
    public _networkName:Network
    private _emitter: EventEmitter
    public _wyvernProtocolReadOnly: WyvernProtocol
    public logger:any
    public _wyvernProtocol: WyvernProtocol

    constructor(web3: any,networkName:Network,gasPrice:BigNumber) {

        this.web3 = web3;
        this._networkName = networkName

        const readonlyProvider = new web3.providers.HttpProvider(networkName == Network.Main ? MAINNET_PROVIDER_URL : RINKEBY_PROVIDER_URL)

        // WyvernJS config for readonly (optimization for infura calls)
        this._wyvernProtocolReadOnly = new WyvernProtocol(readonlyProvider, {
            network: networkName,
            gasPrice: gasPrice,
        })

        this._wyvernProtocol = new WyvernProtocol(web3.provider, {
            network: networkName,
            gasPrice: gasPrice,
        })

        this.logger = console.log
    }

    public _getSchema(schemaName?: WyvernSchemaName): Schema<any> {
        const schemaName_ = schemaName || WyvernSchemaName.ERC721
        const schema = WyvernSchemas.schemas[this._networkName].filter(s => s.name == schemaName_)[0]

        if (!schema) {
            throw new Error(`Trading for this asset (${schemaName_}) is not yet supported. Please contact us or check back later!`)
        }
        return schema
    }

    /**
     * Get an account's balance of any Asset.
     * @param param0 __namedParameters Object
     * @param accountAddress Account address to check
     * @param asset The Asset to check balance for
     * @param retries How many times to retry if balance is 0
     */
    public async getAssetBalance(
        { accountAddress, asset }:
            { accountAddress: string;
                asset: Asset; },
        retries = 1
    ): Promise<BigNumber> {
        const schema = this._getSchema(asset.schemaName)
        const wyAsset = getWyvernAsset(schema, asset)

        if (schema.functions.countOf) {
            // ERC20 or ERC1155 (non-Enjin)

            const abi = schema.functions.countOf(wyAsset)
            const contract = this._getClientsForRead(retries).web3.eth.contract([abi as Web3.FunctionAbi]).at(abi.target)
            const inputValues = abi.inputs.filter(x => x.value !== undefined).map(x => x.value)
            const count = await promisifyCall<BigNumber>(c => contract[abi.name].call(accountAddress, ...inputValues, c))

            if (count !== undefined) {
                return count
            }

        } else if (schema.functions.ownerOf) {
            // ERC721 asset

            const abi = schema.functions.ownerOf(wyAsset)
            const contract = this._getClientsForRead(retries).web3.eth.contract([abi as Web3.FunctionAbi]).at(abi.target)
            if (abi.inputs.filter(x => x.value === undefined)[0]) {
                throw new Error("Missing an argument for finding the owner of this asset")
            }
            const inputValues = abi.inputs.map(i => i.value.toString())
            const owner = await promisifyCall<string>(c => contract[abi.name].call(...inputValues, c))
            if (owner) {
                return owner.toLowerCase() == accountAddress.toLowerCase()
                    ? new BigNumber(1)
                    : new BigNumber(0)
            }

        } else {
            // Missing ownership call - skip check to allow listings
            // by default
            throw new Error('Missing ownership schema for this asset type')
        }

        if (retries <= 0) {
            throw new Error('Unable to get current owner from smart contract')
        } else {
            await delay(500)
            // Recursively check owner again
            return await this.getAssetBalance({accountAddress, asset}, retries - 1)
        }
    }

    /**
     * Get the balance of a fungible token.
     * Convenience method for getAssetBalance for fungibles
     * @param param0 __namedParameters Object
     * @param accountAddress Account address to check
     * @param tokenAddress The address of the token to check balance for
     * @param schemaName Optional schema name for the fungible token
     * @param retries Number of times to retry if balance is undefined
     */
    public async getTokenBalance(
        { accountAddress, tokenAddress, schemaName = WyvernSchemaName.ERC20 }:
            { accountAddress: string;
                tokenAddress: string;
                schemaName?: WyvernSchemaName },
        retries = 1
    ) {

        const asset: Asset = {
            tokenId: null,
            tokenAddress,
            schemaName
        }
        return this.getAssetBalance({ accountAddress, asset }, retries)
    }

    /**
     * Compute the `basePrice` and `extra` parameters to be used to price an order.
     * Also validates the expiration time and auction type.
     * @param tokenAddress Address of the ERC-20 token to use for trading.
     * Use the null address for ETH
     * @param expirationTime When the auction expires, or 0 if never.
     * @param startAmount The base value for the order, in the token's main units (e.g. ETH instead of wei)
     * @param endAmount The end value for the order, in the token's main units (e.g. ETH instead of wei). If unspecified, the order's `extra` attribute will be 0
     */
    public async _getPriceParameters(
        orderSide: OrderSide,
        tokenAddress: string,
        expirationTime: number,
        startAmount: number,
        endAmount ?: number,
        waitingForBestCounterOrder = false,
        englishAuctionReservePrice?: number,
    ) {

        const priceDiff = endAmount != null
            ? startAmount - endAmount
            : 0
        const paymentToken = tokenAddress.toLowerCase()
        const isEther = tokenAddress == NULL_ADDRESS

        const tokens = WyvernSchemas.tokens
        const tokenList = [].concat.apply(tokens[this._networkName].canonicalWrappedEther, tokens[this._networkName].otherTokens)
        const token = tokenList.find((t) => t.address.toLowerCase() === paymentToken);


        // Validation
        if (isNaN(startAmount) || startAmount == null || startAmount < 0) {
            throw new Error(`Starting price must be a number >= 0`)
        }
        if (!isEther && !token) {
            throw new Error(`No ERC-20 token found for '${paymentToken}'`)
        }
        if (isEther && waitingForBestCounterOrder) {
            throw new Error(`English auctions must use wrapped ETH or an ERC-20 token.`)
        }
        if (isEther && orderSide === OrderSide.Buy) {
            throw new Error(`Offers must use wrapped ETH or an ERC-20 token.`)
        }
        if (priceDiff < 0) {
            throw new Error('End price must be less than or equal to the start price.')
        }
        if (priceDiff > 0 && expirationTime == 0) {
            throw new Error('Expiration time must be set if order will change in price.')
        }
        if (englishAuctionReservePrice && !waitingForBestCounterOrder) {
            throw new Error('Reserve prices may only be set on English auctions.')
        }
        if (englishAuctionReservePrice && (englishAuctionReservePrice < startAmount)) {
            throw new Error('Reserve price must be greater than or equal to the start amount.')
        }

        // Note: WyvernProtocol.toBaseUnitAmount(makeBigNumber(startAmount), token.decimals)
        // will fail if too many decimal places, so special-case ether
        const basePrice = isEther
            ? makeBigNumber(this.web3.toWei(startAmount, 'ether')).round()
            : WyvernProtocol.toBaseUnitAmount(makeBigNumber(startAmount), token.decimals)

        const extra = isEther
            ? makeBigNumber(this.web3.toWei(priceDiff, 'ether')).round()
            : WyvernProtocol.toBaseUnitAmount(makeBigNumber(priceDiff), token.decimals)

        const reservePrice = englishAuctionReservePrice
            ? isEther
                ? makeBigNumber(this.web3.toWei(englishAuctionReservePrice, 'ether')).round()
                : WyvernProtocol.toBaseUnitAmount(makeBigNumber(englishAuctionReservePrice), token.decimals)
            : undefined

        return {basePrice, extra, paymentToken, reservePrice}
    }

    /**
     * Get the listing and expiration time paramters for a new order
     * @param expirationTimestamp Timestamp to expire the order (in seconds), or 0 for non-expiring
     * @param listingTimestamp Timestamp to start the order (in seconds), or undefined to start it now
     * @param waitingForBestCounterOrder Whether this order should be hidden until the best match is found
     */
    public _getTimeParameters(
        expirationTimestamp: number,
        listingTimestamp?: number,
        waitingForBestCounterOrder = false
    ) {

        // Validation
        const minExpirationTimestamp = Math.round(Date.now() / 1000 + MIN_EXPIRATION_SECONDS)
        const minListingTimestamp = Math.round(Date.now() / 1000)
        if (expirationTimestamp != 0 && expirationTimestamp < minExpirationTimestamp) {
            throw new Error(`Expiration time must be at least ${MIN_EXPIRATION_SECONDS} seconds from now, or zero (non-expiring).`)
        }
        if (listingTimestamp && listingTimestamp < minListingTimestamp) {
            throw new Error('Listing time cannot be in the past.')
        }
        if (listingTimestamp && expirationTimestamp != 0 && listingTimestamp >= expirationTimestamp) {
            throw new Error('Listing time must be before the expiration time.')
        }
        if (waitingForBestCounterOrder && expirationTimestamp == 0) {
            throw new Error('English auctions must have an expiration time.')
        }
        if (waitingForBestCounterOrder && listingTimestamp) {
            throw new Error(`Cannot schedule an English auction for the future.`)
        }
        if (parseInt(expirationTimestamp.toString()) != expirationTimestamp) {
            throw new Error(`Expiration timestamp must be a whole number of seconds`)
        }

        if (waitingForBestCounterOrder) {
            listingTimestamp = expirationTimestamp
            // Expire one week from now, to ensure server can match it
            // Later, this will expire closer to the listingTime
            expirationTimestamp = expirationTimestamp + ORDER_MATCHING_LATENCY_SECONDS
        } else {
            // Small offset to account for latency
            listingTimestamp = listingTimestamp || Math.round(Date.now() / 1000 - 100)
        }

        return {
            listingTime: makeBigNumber(listingTimestamp),
            expirationTime: makeBigNumber(expirationTimestamp),
        }
    }

    public async _getStaticCallTargetAndExtraData(
        { asset, useTxnOriginStaticCall }:
            { asset: OpenSeaAsset;
                useTxnOriginStaticCall: boolean; }
    ): Promise<{
        staticTarget: string;
        staticExtradata: string;
    }> {
        const isCheezeWizards = [
            CHEEZE_WIZARDS_GUILD_ADDRESS.toLowerCase(),
            CHEEZE_WIZARDS_GUILD_RINKEBY_ADDRESS.toLowerCase()
        ].includes(asset.tokenAddress.toLowerCase())
        const isDecentralandEstate = asset.tokenAddress.toLowerCase() == DECENTRALAND_ESTATE_ADDRESS.toLowerCase()
        const isMainnet = this._networkName == Network.Main

        if (isMainnet && !useTxnOriginStaticCall) {
            // While testing, we will use dummy values for mainnet. We will remove this if-statement once we have pushed the PR once and tested on Rinkeby
            return {
                staticTarget: NULL_ADDRESS,
                staticExtradata: '0x',
            }
        }

        if (isCheezeWizards) {
            const cheezeWizardsBasicTournamentAddress = isMainnet ? CHEEZE_WIZARDS_BASIC_TOURNAMENT_ADDRESS : CHEEZE_WIZARDS_BASIC_TOURNAMENT_RINKEBY_ADDRESS
            const cheezeWizardsBasicTournamentABI = this.web3.eth.contract(CheezeWizardsBasicTournament as any[])
            const cheezeWizardsBasicTournmentInstance = await cheezeWizardsBasicTournamentABI.at(cheezeWizardsBasicTournamentAddress)
            const wizardFingerprint = await rawCall(this.web3, {
                to: cheezeWizardsBasicTournmentInstance.address,
                data: cheezeWizardsBasicTournmentInstance.wizardFingerprint.getData(asset.tokenId)
            })
            return {
                staticTarget: isMainnet
                    ? STATIC_CALL_CHEEZE_WIZARDS_ADDRESS
                    : STATIC_CALL_CHEEZE_WIZARDS_RINKEBY_ADDRESS,
                staticExtradata: encodeCall(
                    getMethod(
                        StaticCheckCheezeWizards,
                        'succeedIfCurrentWizardFingerprintMatchesProvidedWizardFingerprint'),
                    [asset.tokenId, wizardFingerprint, useTxnOriginStaticCall]),
            }
        } else if (isDecentralandEstate && isMainnet) {
            // We stated that we will only use Decentraland estates static
            // calls on mainnet, since Decentraland uses Ropsten
            const decentralandEstateAddress = DECENTRALAND_ESTATE_ADDRESS
            const decentralandEstateABI = this.web3.eth.contract(DecentralandEstates as any[])
            const decentralandEstateInstance = await decentralandEstateABI.at(decentralandEstateAddress)
            const estateFingerprint = await rawCall(this.web3, {
                to: decentralandEstateInstance.address,
                data: decentralandEstateInstance.getFingerprint.getData(asset.tokenId)
            })
            return {
                staticTarget: STATIC_CALL_DECENTRALAND_ESTATES_ADDRESS,
                staticExtradata: encodeCall(
                    getMethod(StaticCheckDecentralandEstates,
                        'succeedIfCurrentEstateFingerprintMatchesProvidedEstateFingerprint'),
                    [asset.tokenId, estateFingerprint, useTxnOriginStaticCall]),
            }
        } else if (useTxnOriginStaticCall) {
            return {
                staticTarget: isMainnet
                    ? STATIC_CALL_TX_ORIGIN_ADDRESS
                    : STATIC_CALL_TX_ORIGIN_RINKEBY_ADDRESS,
                staticExtradata: encodeCall(
                    getMethod(StaticCheckTxOrigin, 'succeedIfTxOriginMatchesHardcodedAddress'),
                    []),
            }
        } else {
            // Noop - no checks
            return {
                staticTarget: NULL_ADDRESS,
                staticExtradata: '0x',
            }
        }
    }

    public async _getRequiredAmountForTakingSellOrder(sell: Order) {
        const currentPrice = await this.getCurrentPrice(sell)
        const estimatedPrice = estimateCurrentPrice(sell)

        const maxPrice = BigNumber.max(currentPrice, estimatedPrice)

        // TODO Why is this not always a big number?
        sell.takerRelayerFee = makeBigNumber(sell.takerRelayerFee)
        const feePercentage = sell.takerRelayerFee.div(INVERSE_BASIS_POINT)
        const fee = feePercentage.times(maxPrice)
        return fee.plus(maxPrice).ceil()
    }

    /**
     * Gets the price for the order using the contract
     * @param order The order to calculate the price for
     */
    public async getCurrentPrice(order: Order) {

        const currentPrice = await this._wyvernProtocolReadOnly.wyvernExchange.calculateCurrentPrice_.callAsync(
            [order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken],
            [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt],
            order.feeMethod,
            order.side,
            order.saleKind,
            order.howToCall,
            order.calldata,
            order.replacementPattern,
            order.staticExtradata,
        )
        return currentPrice
    }

    /**
     * For a fungible token to use in trades (like W-ETH), get the amount
     *  approved for use by the Wyvern transfer proxy.
     * Internal method exposed for dev flexibility.
     * @param param0 __namedParamters Object
     * @param accountAddress Address for the user's wallet
     * @param tokenAddress Address for the token's contract
     * @param proxyAddress User's proxy address. If undefined, uses the token transfer proxy address
     */
    public async _getApprovedTokenCount(
        { accountAddress, tokenAddress, proxyAddress }:
            { accountAddress: string;
                tokenAddress?: string;
                proxyAddress?: string;
            }
    ) {
        if (!tokenAddress) {
            tokenAddress = WyvernSchemas.tokens[this._networkName].canonicalWrappedEther.address
        }
        const addressToApprove = proxyAddress || WyvernProtocol.getTokenTransferProxyAddress(this._networkName)
        const approved = await rawCall(this.web3, {
            from: accountAddress,
            to: tokenAddress,
            data: encodeCall(getMethod(ERC20, 'allowance'),
                [accountAddress, addressToApprove]),
        })
        return makeBigNumber(approved)
    }
    /**
     * Approve a fungible token (e.g. W-ETH) for use in trades.
     * Called internally, but exposed for dev flexibility.
     * Checks to see if the minimum amount is already approved, first.
     * @param param0 __namedParamters Object
     * @param accountAddress The user's wallet address
     * @param tokenAddress The contract address of the token being approved
     * @param proxyAddress The user's proxy address. If unspecified, uses the Wyvern token transfer proxy address.
     * @param minimumAmount The minimum amount needed to skip a transaction. Defaults to the max-integer.
     * @returns Transaction hash if a new transaction occurred, otherwise null
     */
    public async approveFungibleToken(
        { accountAddress,
            tokenAddress,
            proxyAddress,
            minimumAmount = WyvernProtocol.MAX_UINT_256 }:
            { accountAddress: string;
                tokenAddress: string;
                proxyAddress?: string;
                minimumAmount?: BigNumber }
    ): Promise<string | null> {
        proxyAddress = proxyAddress || WyvernProtocol.getTokenTransferProxyAddress(this._networkName)

        const approvedAmount = await this._getApprovedTokenCount({
            accountAddress,
            tokenAddress,
            proxyAddress
        })

        if (approvedAmount.greaterThanOrEqualTo(minimumAmount)) {
            this.logger('Already approved enough currency for trading')
            return null
        }

        this.logger(`Not enough token approved for trade: ${approvedAmount} approved to transfer ${tokenAddress}`)

        this._dispatch(EventType.ApproveCurrency, {
            accountAddress,
            contractAddress: tokenAddress,
            proxyAddress
        })

        const hasOldApproveMethod = [ENJIN_COIN_ADDRESS, MANA_ADDRESS].includes(tokenAddress.toLowerCase())

        if (minimumAmount.greaterThan(0) && hasOldApproveMethod) {
            // Older erc20s require initial approval to be 0
            await this.unapproveFungibleToken({ accountAddress, tokenAddress, proxyAddress })
        }

        const gasPrice = await this._computeGasPrice()
        const txHash = await sendRawTransaction(this.web3, {
            from: accountAddress,
            to: tokenAddress,
            data: encodeCall(getMethod(ERC20, 'approve'),
                // Always approve maximum amount, to prevent the need for followup
                // transactions (and because old ERC20s like MANA/ENJ are non-compliant)
                [proxyAddress, WyvernProtocol.MAX_UINT_256.toString()]),
            gasPrice
        }, error => {
            this._dispatch(EventType.TransactionDenied, { error, accountAddress })
        })

        await this._confirmTransaction(txHash, EventType.ApproveCurrency, "Approving currency for trading", async () => {
            const newlyApprovedAmount = await this._getApprovedTokenCount({
                accountAddress,
                tokenAddress,
                proxyAddress
            })
            return newlyApprovedAmount.greaterThanOrEqualTo(minimumAmount)
        })
        return txHash
    }


    /**
     * Un-approve a fungible token (e.g. W-ETH) for use in trades.
     * Called internally, but exposed for dev flexibility.
     * Useful for old ERC20s that require a 0 approval count before
     * changing the count
     * @param param0 __namedParamters Object
     * @param accountAddress The user's wallet address
     * @param tokenAddress The contract address of the token being approved
     * @param proxyAddress The user's proxy address. If unspecified, uses the Wyvern token transfer proxy address.
     * @returns Transaction hash
     */
    public async unapproveFungibleToken(
        { accountAddress,
            tokenAddress,
            proxyAddress }:
            { accountAddress: string;
                tokenAddress: string;
                proxyAddress?: string; }
    ): Promise<string> {
        proxyAddress = proxyAddress || WyvernProtocol.getTokenTransferProxyAddress(this._networkName)

        const gasPrice = await this._computeGasPrice()

        const txHash = await sendRawTransaction(this.web3, {
            from: accountAddress,
            to: tokenAddress,
            data: encodeCall(getMethod(ERC20, 'approve'), [proxyAddress, 0]),
            gasPrice
        }, error => {
            this._dispatch(EventType.TransactionDenied, { error, accountAddress })
        })

        await this._confirmTransaction(txHash, EventType.UnapproveCurrency, "Resetting Currency Approval", async () => {
            const newlyApprovedAmount = await this._getApprovedTokenCount({
                accountAddress,
                tokenAddress,
                proxyAddress
            })
            return newlyApprovedAmount.isZero()
        })
        return txHash
    }

    /**
     * Compute the gas price for sending a txn, in wei
     * Will be slightly above the mean to make it faster
     */
    public async _computeGasPrice(): Promise<BigNumber> {
        const meanGas = await getCurrentGasPrice(this.web3)
        const weiToAdd = this.web3.toWei(this.gasPriceAddition, 'gwei')
        return meanGas.plus(weiToAdd)
    }

    public async _confirmTransaction(transactionHash: string, event: EventType, description: string, testForSuccess?: () => Promise<boolean>): Promise<void> {

        const transactionEventData = { transactionHash, event }
        this.logger(`Transaction started: ${description}`)

        if (transactionHash == NULL_BLOCK_HASH) {
            // This was a smart contract wallet that doesn't know the transaction
            this._dispatch(EventType.TransactionCreated, { event })

            if (!testForSuccess) {
                // Wait if test not implemented
                this.logger(`Unknown action, waiting 1 minute: ${description}`)
                await delay(60 * 1000)
                return
            }

            return await this._pollCallbackForConfirmation(event, description, testForSuccess)
        }

        // Normal wallet
        try {
            this._dispatch(EventType.TransactionCreated, transactionEventData)
            await confirmTransaction(this.web3, transactionHash)
            this.logger(`Transaction succeeded: ${description}`)
            this._dispatch(EventType.TransactionConfirmed, transactionEventData)
        } catch (error) {
            this.logger(`Transaction failed: ${description}`)
            this._dispatch(EventType.TransactionFailed, {
                ...transactionEventData, error
            })
            throw error
        }
    }

    private async _pollCallbackForConfirmation(event: EventType, description: string, testForSuccess: () => Promise<boolean>): Promise<void> {

        return new Promise<void>(async (resolve, reject) => {

            const initialRetries = 60

            const testResolve: (r: number) => Promise<void> = async retries => {

                const wasSuccessful = await testForSuccess()
                if (wasSuccessful) {
                    this.logger(`Transaction succeeded: ${description}`)
                    this._dispatch(EventType.TransactionConfirmed, { event })
                    return resolve()
                } else if (retries <= 0) {
                    return reject()
                }

                if (retries % 10 == 0) {
                    this.logger(`Tested transaction ${initialRetries - retries + 1} times: ${description}`)
                }
                await delay(5000)
                return testResolve(retries - 1)
            }

            return testResolve(initialRetries)
        })
    }


    /**
     * Validate fee parameters
     * @param totalBuyerFeeBasisPoints Total buyer fees
     * @param totalSellerFeeBasisPoints Total seller fees
     */
    public _validateFees(totalBuyerFeeBasisPoints: number, totalSellerFeeBasisPoints: number) {
        const maxFeePercent = INVERSE_BASIS_POINT / 100

        if (totalBuyerFeeBasisPoints > INVERSE_BASIS_POINT
            || totalSellerFeeBasisPoints > INVERSE_BASIS_POINT) {
            throw new Error(`Invalid buyer/seller fees: must be less than ${maxFeePercent}%`)
        }

        if (totalBuyerFeeBasisPoints < 0
            || totalSellerFeeBasisPoints < 0) {
            throw new Error(`Invalid buyer/seller fees: must be at least 0%`)
        }
    }

    public _dispatch(event: EventType, data: EventData) {
        this._emitter.emit(event, data)
    }

    /**
     * Get the clients to use for a read call
     * @param retries current retry value
     */
    private _getClientsForRead(
        retries = 1
    ): { web3: any, wyvernProtocol: WyvernProtocol } {
        if (retries > 0) {
            // Use injected provider by default
            return {
                'web3': this.web3,
                'wyvernProtocol': this._wyvernProtocol
            }
        } else {
            // Use provided provider as fallback
            return {
                'web3': this.web3,
                'wyvernProtocol': this._wyvernProtocolReadOnly
            }
        }
    }

    public async _validateOrder(order: Order): Promise<boolean> {

        const isValid = await this._wyvernProtocolReadOnly.wyvernExchange.validateOrder_.callAsync(
            [order.exchange, order.maker, order.taker, order.feeRecipient, order.target, order.staticTarget, order.paymentToken],
            [order.makerRelayerFee, order.takerRelayerFee, order.makerProtocolFee, order.takerProtocolFee, order.basePrice, order.extra, order.listingTime, order.expirationTime, order.salt],
            order.feeMethod,
            order.side,
            order.saleKind,
            order.howToCall,
            order.calldata,
            order.replacementPattern,
            order.staticExtradata,
            order.v || 0,
            order.r || NULL_BLOCK_HASH,
            order.s || NULL_BLOCK_HASH)

        return isValid

    }
}