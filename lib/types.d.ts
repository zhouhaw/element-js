import { BigNumber } from 'bignumber.js';
import { Network } from './schema/types';
export { Network, BigNumber };
export interface ExchangeProtocolConfig {
    network: Network;
    gasPrice?: BigNumber;
    exchangeContractAddress?: string;
    proxyRegistryContractAddress?: string;
}
export interface ElementAPIConfig {
    networkName: Network;
    networkID: number;
    account?: string;
    gasPrice?: number;
}
export declare enum AbiType {
    Function = "function",
    Constructor = "constructor",
    Event = "event",
    Fallback = "fallback"
}
interface FunctionParameter {
    name: string;
    type: string;
}
declare type ConstructorStateMutability = 'nonpayable' | 'payable';
declare type StateMutability = 'pure' | 'view' | ConstructorStateMutability;
interface MethodAbi {
    type: AbiType.Function;
    name: string;
    inputs: FunctionParameter[];
    outputs: FunctionParameter[];
    constant: boolean;
    stateMutability: StateMutability;
    payable: boolean;
}
interface ConstructorAbi {
    type: AbiType.Constructor;
    inputs: FunctionParameter[];
    payable: boolean;
    stateMutability: ConstructorStateMutability;
}
interface FallbackAbi {
    type: AbiType.Fallback;
    payable: boolean;
}
export declare type FunctionAbi = MethodAbi | ConstructorAbi | FallbackAbi;
export declare enum ElementSchemaName {
    ERC20 = "ERC20",
    ERC721 = "ERC721",
    ERC1155 = "ERC1155",
    LegacyEnjin = "Enjin",
    ENSShortNameAuction = "ENSShortNameAuction",
    ElementShardType = "ElementShardType",
    CryptoPunks = "CryptoPunks"
}
interface ElementNFTAsset {
    id: string;
    address: string;
}
interface ElementFTAsset {
    id?: string;
    address: string;
    quantity: string;
}
export declare type ElementAsset = ElementNFTAsset | ElementFTAsset;
export interface WyvernBundle {
    assets: ElementAsset[];
    schemas: ElementSchemaName[];
    name?: string;
    description?: string;
    external_link?: string;
}
export interface ExchangeMetadataForAsset {
    asset: ElementAsset;
    schema: ElementSchemaName;
    referrerAddress?: string;
}
export interface ExchangeMetadataForBundle {
    bundle: WyvernBundle;
    referrerAddress?: string;
}
export declare type ExchangeMetadata = ExchangeMetadataForAsset | ExchangeMetadataForBundle;
export declare enum TokenStandardVersion {
    Unsupported = "unsupported",
    Locked = "locked",
    Enjin = "1155-1.0",
    ERC721v1 = "1.0",
    ERC721v2 = "2.0",
    ERC721v3 = "3.0"
}
/**
 * Simple, unannotated asset spec
 */
export interface Asset {
    tokenId: string | null;
    tokenAddress: string;
    schemaName?: ElementSchemaName;
    version?: TokenStandardVersion;
    name?: string;
    data?: string;
    decimals?: number;
}
export interface ECSignature {
    v: number;
    r: string;
    s: string;
}
export interface OrderJSON extends Partial<ECSignature> {
    exchange: string;
    maker: string;
    taker: string;
    makerRelayerFee: string;
    takerRelayerFee: string;
    makerProtocolFee: string;
    takerProtocolFee: string;
    makerReferrerFee: string;
    feeRecipient: string;
    feeMethod: number;
    side: number;
    saleKind: number;
    target: string;
    howToCall: number;
    dataToCall: string;
    replacementPattern: string;
    staticTarget: string;
    staticExtradata: string;
    paymentToken: string;
    quantity: string;
    basePrice: string;
    extra: string;
    listingTime: number | string;
    expirationTime: number | string;
    salt: string;
    metadata: ExchangeMetadata;
    hash: string;
}
export interface WyvernOrder {
    exchange: string;
    maker: string;
    taker: string;
    makerRelayerFee: BigNumber;
    takerRelayerFee: BigNumber;
    makerProtocolFee: BigNumber;
    takerProtocolFee: BigNumber;
    feeRecipient: string;
    feeMethod: number;
    side: number;
    saleKind: number;
    target: string;
    howToCall: number;
    dataToCall: string;
    replacementPattern: string;
    staticTarget: string;
    staticExtradata: string;
    paymentToken: string;
    basePrice: BigNumber;
    extra: BigNumber;
    listingTime: BigNumber;
    expirationTime: BigNumber;
    salt: BigNumber;
}
export declare enum FeeMethod {
    ProtocolFee = 0,
    SplitFee = 1
}
export declare enum OrderSide {
    Buy = 0,
    Sell = 1
}
export declare enum SaleKind {
    FixedPrice = 0,
    EnglishAuction = 1,
    DutchAuction = 2
}
export declare enum HowToCall {
    Call = 0,
    DelegateCall = 1,
    StaticCall = 2,
    Create = 3
}
export interface UnhashedOrder extends WyvernOrder {
    feeMethod: FeeMethod;
    side: OrderSide;
    saleKind: SaleKind;
    howToCall: HowToCall;
    quantity: BigNumber;
    makerReferrerFee: BigNumber;
    waitingForBestCounterOrder?: boolean;
    englishAuctionReservePrice?: BigNumber;
    metadata: ExchangeMetadata;
}
export interface UnsignedOrder extends UnhashedOrder {
    hash: string;
}
/**
 * Orders don't need to be signed if they're pre-approved
 * with a transaction on the contract to approveOrder_
 */
export interface Order extends UnsignedOrder, Partial<ECSignature> {
    createdTime?: BigNumber;
    currentPrice?: BigNumber;
    currentBounty?: BigNumber;
    makerAccount?: ElementAccount;
    takerAccount?: ElementAccount;
    paymentTokenContract?: ElementFungibleToken;
    feeRecipientAccount?: ElementAccount;
    cancelledOrFinalized?: boolean;
    markedInvalid?: boolean;
    asset?: any;
    assetBundle?: any;
}
export interface Token {
    name: string;
    symbol: string;
    decimals: number;
    address: string;
}
export interface ElementFungibleToken extends Token {
    imageUrl?: string;
    ethPrice?: string;
    usdPrice?: string;
}
export interface ElementUser {
    username: string;
}
export interface ElementAccount {
    address: string;
    config: string;
    profileImgUrl: string;
    user: ElementUser | null;
}
