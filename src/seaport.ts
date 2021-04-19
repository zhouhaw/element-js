import * as Web3 from 'web3'
import { WyvernProtocol } from 'wyvern-js'
import * as WyvernSchemas from 'wyvern-schemas'
import { Schema } from 'wyvern-schemas/dist/types'
import * as _ from 'lodash'
import { OpenSeaAPI } from './api'
import { ECSignature, FeeMethod, HowToCall, Network, OpenSeaAPIConfig, OrderSide, SaleKind, UnhashedOrder, Order, UnsignedOrder, PartialReadonlyContractAbi, EventType, EventData, OpenSeaAsset, WyvernSchemaName, WyvernAtomicMatchParameters, OpenSeaFungibleToken, WyvernAsset, ComputedFees, Asset, WyvernNFTAsset, WyvernFTAsset, TokenStandardVersion } from './types'
import {
    confirmTransaction,
    makeBigNumber, orderToJSON,
    personalSignAsync,
    sendRawTransaction, estimateCurrentPrice, getOrderHash,
    getCurrentGasPrice, delay, assignOrdersToSides, estimateGas,
    validateAndFormatWalletAddress,
    getWyvernBundle,
    getWyvernAsset,
    getTransferFeeSettings,
    rawCall,
    promisifyCall,
    annotateERC721TransferABI,
    annotateERC20TransferABI,
    onDeprecated,
    getNonCompliantApprovalAddress,
    isContractAddress,
} from './utils/utils'

import { BigNumber } from 'bignumber.js'
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
    MANA_ADDRESS
} from './constants'

export class OpenSeaPort {

    // Web3 instance to use
    public web3: Web3
    public web3ReadOnly: Web3
    // Logger function to use when debugging
    public logger: (arg: string) => void
    // API instance on this seaport
    public readonly api: OpenSeaAPI
    // Extra gwei to add to the mean gas price when making transactions
    public gasPriceAddition = new BigNumber(3)
    // Multiply gas estimate by this factor when making transactions
    public gasIncreaseFactor = DEFAULT_GAS_INCREASE_FACTOR

    private _networkName: Network
    private _wyvernProtocol: WyvernProtocol
    private _wyvernProtocolReadOnly: WyvernProtocol
    private _wrappedNFTFactoryAddress: string
    private _wrappedNFTLiquidationProxyAddress: string
    private _uniswapFactoryAddress: string

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
        this.api = new OpenSeaAPI(apiConfig)

        this._networkName = apiConfig.networkName

        const readonlyProvider = new Web3.providers.HttpProvider(this._networkName == Network.Main ? MAINNET_PROVIDER_URL : RINKEBY_PROVIDER_URL)

        // Web3 Config
        let _web3 = new Web3(provider);

        this.web3ReadOnly = new Web3(readonlyProvider)

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

        // WrappedNFTLiquidationProxy Config
        this._wrappedNFTFactoryAddress = this._networkName == Network.Main ? WRAPPED_NFT_FACTORY_ADDRESS_MAINNET : WRAPPED_NFT_FACTORY_ADDRESS_RINKEBY
        this._wrappedNFTLiquidationProxyAddress = this._networkName == Network.Main ? WRAPPED_NFT_LIQUIDATION_PROXY_ADDRESS_MAINNET : WRAPPED_NFT_LIQUIDATION_PROXY_ADDRESS_RINKEBY
        this._uniswapFactoryAddress = this._networkName == Network.Main ? UNISWAP_FACTORY_ADDRESS_MAINNET : UNISWAP_FACTORY_ADDRESS_RINKEBY



        // Debugging: default to nothing
        this.logger = logger || ((arg: string) => arg)
    }


}