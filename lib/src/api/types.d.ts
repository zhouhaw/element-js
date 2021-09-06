import { Asset, Token } from '../types';
export declare enum MakeOrderType {
    FixPriceOrder = "FixPriceOrder",
    DutchAuctionOrder = "DutchAuctionOrder",
    EnglishAuctionOrder = "EnglishAuctionOrder",
    LowerPriceOrder = "LowerPriceOrder",
    MakeOfferOrder = "MakeOfferOrder",
    EnglishAuctionBiddingOrder = "EnglishAuctionBiddingOrder"
}
export interface TradeBestAskType {
    bestAskSaleKind: number;
    bestAskPrice: number;
    bestAskToken: string;
    bestAskPriceBase: number;
    bestAskPriceUSD: number;
    bestAskListingDate: string;
    bestAskExpirationDate: string;
    bestAskPriceCNY: number;
    bestAskCreatedDate: string;
    bestAskOrderString: string;
    bestAskOrderType: number;
    bestAskOrderQuantity: number;
    bestAskTokenContract: Token;
}
export interface CreateOrderParams {
    asset: Asset;
    quantity?: number;
    paymentToken?: Token;
}
export interface SellOrderParams extends CreateOrderParams {
    listingTime?: number;
    expirationTime?: number;
    startAmount: number;
    endAmount?: number;
    buyerAddress?: string;
}
export interface BuyOrderParams extends CreateOrderParams {
    expirationTime: number;
    startAmount: number;
}
