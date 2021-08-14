import { Asset, CallBack } from '../index';
export declare function transferFromERC1155({ erc1155Contract, from, to, tokenId, amount }: {
    erc1155Contract: any;
    from: string;
    to: string;
    tokenId: any;
    amount: number;
}, callBack?: CallBack): Promise<any>;
export declare function transferFromERC721({ erc721Contract, from, to, tokenId, amount }: {
    erc721Contract: any;
    from: string;
    to: string;
    tokenId: any;
    amount: number;
}, callBack?: CallBack): Promise<any>;
export declare function transferFromSchema({ contract, asset, from, to, amount }: {
    contract: any;
    asset: Asset;
    from: string;
    to: string;
    amount: number;
}, callBack?: CallBack): Promise<boolean>;
export declare function transferFromERC20({ erc20Contract, from, to, tokenId, amount }: {
    erc20Contract: any;
    from: string;
    to: string;
    tokenId: any;
    amount: number;
}, callBack?: CallBack): Promise<any>;
export declare function transferFromWETH({ WETHContract, from, to, tokenId, amount }: {
    WETHContract: any;
    from: string;
    to: string;
    tokenId: any;
    amount: number;
}, callBack?: CallBack): Promise<any>;
/**
 * Validates that an address exists, isn't null, and is properly
 * formatted for Wyvern and OpenSea
 * @param address input address
 */
export declare function validateAndFormatWalletAddress(web3: any, address: string): string;
