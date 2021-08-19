import { CallBack } from '..';
import { ExchangeMetadata } from '../types';
export declare function registerProxy({ proxyRegistryContract, account, callBack }: {
    proxyRegistryContract: any;
    account: string;
    callBack?: CallBack;
}): Promise<boolean>;
export declare function approveTokenTransferProxy({ exchangeContract, erc20Contract, account, callBack }: {
    exchangeContract: any;
    erc20Contract: any;
    account: string;
    callBack?: CallBack;
}): Promise<boolean>;
export declare function approveERC1155TransferProxy({ proxyRegistryContract, erc1155Contract, account, callBack }: {
    proxyRegistryContract: any;
    erc1155Contract: any;
    account: string;
    callBack?: CallBack;
}): Promise<boolean>;
export declare function approveERC721TransferProxy({ proxyRegistryContract, erc721Contract, account, tokenId, callBack }: {
    proxyRegistryContract: any;
    erc721Contract: any;
    account: string;
    tokenId?: string;
    callBack?: CallBack;
}): Promise<boolean>;
export declare function approveSchemaProxy({ contract, orderMetadata, callBack }: {
    contract: any;
    orderMetadata: ExchangeMetadata;
    callBack?: CallBack;
}): Promise<boolean>;
