import { BigNumber } from './utils/constants';
import { Network } from './schema/types';
export { Network };
export interface ElementAPIConfig {
    networkName: Network;
    paymentTokens?: Array<Token>;
    networkID?: number;
    account?: string;
    gasPrice?: number;
}
export declare enum AbiType {
    Function = "function",
    Constructor = "constructor",
    Event = "event",
    Fallback = "fallback"
}
export declare enum ElementSchemaName {
    ERC20 = "ERC20",
    ERC721 = "ERC721",
    ERC1155 = "ERC1155",
    CryptoKitties = "CryptoKitties"
}
interface ElementNFTAsset {
    id: string;
    address: string;
    data?: string;
    collection?: ElementCollection;
}
interface ElementFTAsset {
    id?: string;
    address: string;
    quantity: string;
    data?: string;
    collection?: ElementCollection;
}
export declare type ElementAsset = ElementNFTAsset | ElementFTAsset;
export interface ElementBundle {
    assets: ElementAsset[];
    schemas: ElementSchemaName[];
    name?: string;
    description?: string;
    external_link?: string;
}
export interface ExchangeMetadataForAsset {
    asset: ElementAsset;
    schema: ElementSchemaName;
    version?: number;
    referrerAddress?: string;
}
export interface ExchangeMetadataForBundle {
    bundle: ElementBundle;
    referrerAddress?: string;
}
export declare type ExchangeMetadata = ExchangeMetadataForAsset;
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
    tokenId: string | undefined;
    tokenAddress: string;
    schemaName: ElementSchemaName;
    version?: TokenStandardVersion;
    name?: string;
    data?: string;
    decimals?: number;
    collection?: ElementCollection;
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
    englishAuctionReservePrice: string | undefined;
    extra: string;
    listingTime: number | string;
    expirationTime: number | string;
    salt: string;
    metadata: ExchangeMetadata;
    hash: string;
}
export interface ElementOrder {
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
    DutchAuction = 1
}
export declare enum HowToCall {
    Call = 0,
    DelegateCall = 1,
    StaticCall = 2,
    Create = 3
}
export interface UnhashedOrder extends ElementOrder {
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
/******************** Fees ***********************/
/**
 * The basis point values of each type of fee
 */
export interface ElementFees {
    elementSellerFeeBasisPoints: number;
    elementBuyerFeeBasisPoints: number;
    devSellerFeeBasisPoints: number;
    devBuyerFeeBasisPoints: number;
}
/**
 * Fully computed fees including bounties and transfer fees
 */
export interface ComputedFees extends ElementFees {
    totalBuyerFeeBasisPoints: number;
    totalSellerFeeBasisPoints: number;
    transferFee: BigNumber;
    transferFeeTokenAddress: string | null;
    sellerBountyBasisPoints: number;
}
export interface Token {
    name: string;
    symbol: string;
    decimals: number;
    address: string;
}
/**
 * Full annotated Fungible Token spec with OpenSea metadata
 */
export interface ElemetnFungibleToken extends Token {
    imageUrl?: string;
    ethPrice?: string;
    usdPrice?: string;
}
/**
 * Annotated collection with OpenSea metadata
 */
export interface ElementCollection extends ElementFees {
    name: string;
    description: string;
    imageUrl: string;
    transferFee: BigNumber | string | null;
    transferFeePaymentToken: ElemetnFungibleToken | null;
}
