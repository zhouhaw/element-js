import { Asset, Order, OrderJSON, Token, UnhashedOrder } from './types';
import { Contracts } from './contracts';
export declare enum OrderCheckStatus {
    StartOrderHashSign = "startOrderHashSign",
    EndOrderHashSign = "endOrderHashSign",
    StartOrderMatch = "startOrderMatch",
    OrderMatchTxHash = "orderMatchTxHash",
    EndOrderMatch = "endOrderMatch",
    StartCancelOrder = "startCancelOrder",
    EndCancelOrder = "endCancelOrder",
    RegisterTxHash = "registerTxHash",
    EndRegister = "endRegister",
    ApproveErc20TxHash = "approveErc20TxHash",
    EndApproveErc20 = "endApproveErc20",
    ApproveErc721TxHash = "approveErc721TxHash",
    EndApproveErc721 = "endApproveErc721",
    ApproveErc1155TxHash = "approveErc1155TxHash",
    EndApproveErc1155 = "endApproveErc1155",
    TransferErc1155 = "transferErc1155",
    TransferErc721 = "transferErc721",
    End = "End"
}
export interface CallBack {
    next<T>(arg: OrderCheckStatus, data?: any): OrderCheckStatus;
}
export declare function Sleep(ms: number): Promise<unknown>;
export declare class Orders extends Contracts {
    makeMatchingOrder({ signedOrder, accountAddress, recipientAddress }: {
        signedOrder: Order;
        accountAddress: string;
        recipientAddress?: string;
    }): {
        buy: Order;
        sell: Order;
    };
    orderMatch({ buy, sell, accountAddress, metadata }: {
        buy: Order;
        sell: Order;
        accountAddress: string;
        metadata?: string;
    }, callBack?: CallBack): Promise<any>;
    creatSignedOrder({ unHashOrder }: {
        unHashOrder: UnhashedOrder;
    }, callBack?: CallBack): Promise<OrderJSON>;
    createBuyOrder({ asset, accountAddress, startAmount, paymentTokenObj, quantity, expirationTime, sellOrder, referrerAddress }: {
        asset: Asset;
        accountAddress: string;
        startAmount: number;
        paymentTokenObj: Token;
        quantity?: number;
        expirationTime?: number;
        sellOrder?: Order;
        referrerAddress?: string;
    }, callBack?: CallBack): Promise<OrderJSON>;
    createSellOrder({ asset, accountAddress, startAmount, paymentTokenObj, endAmount, quantity, listingTime, expirationTime, waitForHighestBid, englishAuctionReservePrice, extraBountyBasisPoints, buyerAddress, buyerEmail }: {
        asset: Asset;
        accountAddress: string;
        startAmount: number;
        paymentTokenObj?: Token;
        endAmount?: number;
        quantity?: number;
        listingTime?: number;
        expirationTime?: number;
        waitForHighestBid?: boolean;
        englishAuctionReservePrice?: number;
        extraBountyBasisPoints?: number;
        buyerAddress?: string;
        buyerEmail?: string;
    }, callBack?: CallBack): Promise<OrderJSON>;
    cancelOrder({ order, accountAddress }: {
        order: Order;
        accountAddress: string;
    }, callBack?: CallBack): Promise<any>;
}
