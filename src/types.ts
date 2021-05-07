import { BigNumber } from 'bignumber.js'
import { Network } from './schema/types'

export { Network, BigNumber }

export interface ExchangeProtocolConfig {
  network: Network
  gasPrice?: BigNumber
  exchangeContractAddress?: string
  proxyRegistryContractAddress?: string
}

export interface ElementAPIConfig {
  networkName: Network
  networkID: number
  account?: string
  gasPrice?: number
}

export enum AbiType {
  Function = 'function',
  Constructor = 'constructor',
  Event = 'event',
  Fallback = 'fallback',
}

interface FunctionParameter {
  name: string;
  type: string;
}

type ConstructorStateMutability = 'nonpayable' | 'payable';
type StateMutability = 'pure' | 'view' | ConstructorStateMutability;

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

export type FunctionAbi = MethodAbi | ConstructorAbi | FallbackAbi;

// Wyvern Schemas (see https://github.com/ProjectOpenSea/wyvern-schemas)
export enum ElementSchemaName {
  ERC20 = 'ERC20',
  ERC721 = 'ERC721',
  ERC1155 = 'ERC1155',
  LegacyEnjin = 'Enjin',
  ENSShortNameAuction = 'ENSShortNameAuction',
  ElementShardType = 'ElementShardType',
  CryptoPunks = 'CryptoPunks'
}

interface ElementNFTAsset {
  id: string
  address: string
}

interface ElementFTAsset {
  id?: string
  address: string
  quantity: string
}

export type ElementAsset = ElementNFTAsset | ElementFTAsset

// Abstractions over Wyvern assets for bundles
export interface WyvernBundle {
  assets: ElementAsset[]
  schemas: ElementSchemaName[]
  name?: string
  description?: string
  external_link?: string
}

export interface ExchangeMetadataForAsset {
  asset: ElementAsset
  schema: ElementSchemaName
  referrerAddress?: string
}

export interface ExchangeMetadataForBundle {
  bundle: WyvernBundle
  referrerAddress?: string
}

export type ExchangeMetadata = ExchangeMetadataForAsset | ExchangeMetadataForBundle

export enum TokenStandardVersion {
  Unsupported = 'unsupported',
  Locked = 'locked',
  Enjin = '1155-1.0',
  ERC721v1 = '1.0',
  ERC721v2 = '2.0',
  ERC721v3 = '3.0'
}

/**
 * Simple, unannotated asset spec
 */
export interface Asset {
  // The asset's token ID, or null if ERC-20
  tokenId: string | null
  // The asset's contract address
  tokenAddress: string
  // The Wyvern schema name (e.g. "ERC721") for this asset
  schemaName?: ElementSchemaName
  // The token standard version of this asset
  version?: TokenStandardVersion
  // Optional for ENS names
  name?: string
  data?: string
  // Optional for fungible items
  decimals?: number
}

//----------- OrderJSON--------------
export interface ECSignature {
  v: number
  r: string
  s: string
}

export interface OrderJSON extends Partial<ECSignature> {
  exchange: string
  maker: string
  taker: string
  makerRelayerFee: string
  takerRelayerFee: string
  makerProtocolFee: string
  takerProtocolFee: string
  makerReferrerFee: string
  feeRecipient: string
  feeMethod: number
  side: number
  saleKind: number
  target: string
  howToCall: number
  dataToCall: string
  replacementPattern: string
  staticTarget: string
  staticExtradata: string
  paymentToken: string

  quantity: string
  basePrice: string
  // englishAuctionReservePrice: string | undefined
  extra: string

  // createdTime is undefined when order hasn't been posted yet
  // createdTime?: number | string
  listingTime: number | string
  expirationTime: number | string

  salt: string

  metadata: ExchangeMetadata

  hash: string
}

//---------- Orderbook-----------

export interface WyvernOrder {
  exchange: string
  maker: string
  taker: string
  makerRelayerFee: BigNumber
  takerRelayerFee: BigNumber
  makerProtocolFee: BigNumber
  takerProtocolFee: BigNumber
  feeRecipient: string
  feeMethod: number
  side: number
  saleKind: number
  target: string
  howToCall: number
  dataToCall: string
  replacementPattern: string
  staticTarget: string
  staticExtradata: string
  paymentToken: string
  basePrice: BigNumber
  extra: BigNumber
  listingTime: BigNumber
  expirationTime: BigNumber
  salt: BigNumber
}

export enum FeeMethod {
  ProtocolFee = 0,
  SplitFee = 1
}

export enum OrderSide {
  Buy = 0,
  Sell = 1
}

export enum SaleKind {
  FixedPrice = 0,
  EnglishAuction = 1,
  DutchAuction = 2
}

export enum HowToCall {
  Call = 0,
  DelegateCall = 1,
  StaticCall = 2,
  Create = 3
}

export interface UnhashedOrder extends WyvernOrder {
  feeMethod: FeeMethod
  side: OrderSide
  saleKind: SaleKind
  howToCall: HowToCall
  quantity: BigNumber

  // OpenSea-specific 
  makerReferrerFee: BigNumber
  waitingForBestCounterOrder?: boolean
  englishAuctionReservePrice?: BigNumber

  metadata: ExchangeMetadata
}

export interface UnsignedOrder extends UnhashedOrder {
  hash: string
}

/**
 * Orders don't need to be signed if they're pre-approved
 * with a transaction on the contract to approveOrder_
 */
export interface Order extends UnsignedOrder, Partial<ECSignature> {
  // Read-only server-side appends
  createdTime?: BigNumber
  currentPrice?: BigNumber
  currentBounty?: BigNumber
  makerAccount?: ElementAccount
  takerAccount?: ElementAccount
  paymentTokenContract?: ElementFungibleToken
  feeRecipientAccount?: ElementAccount
  cancelledOrFinalized?: boolean
  markedInvalid?: boolean
  asset?: any
  assetBundle?: any
}

// Asset
export interface Token {
  name: string;
  symbol: string;
  decimals: number;
  address: string;
}

export interface ElementFungibleToken extends Token {
  imageUrl?: string
  ethPrice?: string
  usdPrice?: string
}

//------- Account -----

export interface ElementUser {
  // Username for this user
  username: string
}

//
export interface ElementAccount {
  // Wallet address for this account
  address: string
  // Public configuration info, including "affiliate" for users who are in the Element affiliate program
  config: string

  // This account's profile image - by default, randomly generated by the server
  profileImgUrl: string

  // More information explicitly set by this account's owner on Element
  user: ElementUser | null
}


