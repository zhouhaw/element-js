import { ExchangeMetadata } from '../../types';
import { AnnotatedFunctionABI } from '../types';
export declare const schemas: {
    rinkeby: import("../types").Schema<any>[];
    private: import("../types").Schema<any>[];
    main: import("../types").Schema<any>[];
    mumbai: import("../types").Schema<any>[];
    polygon: import("../types").Schema<any>[];
};
export declare const common: {
    ElementRegistrySchemas: Required<Pick<import("../types").ExchangeSchema<import("./common/Element/registry").Registry>, "address" | "functions">>;
    ElementExchangeSchemas: Required<Pick<import("../types").ExchangeSchema<import("./common/Element/exchange").Exchange>, "functions">>;
    ERC20Schema: import("../types").Schema<import("./common/ERC20").FungibleTradeType>;
    ERC721Schema: import("../types").Schema<import("./common/ERC721").NonFungibleContractType>;
    ERC1155Schema: import("../types").Schema<import("./common/ERC1155").SemiFungibleTradeType>;
};
export declare function getBalanceSchemas(metadata: ExchangeMetadata): AnnotatedFunctionABI;
export declare function getIsApproveSchemas(metadata: ExchangeMetadata): AnnotatedFunctionABI;
export declare function getApproveSchemas(metadata: ExchangeMetadata): AnnotatedFunctionABI;
export declare function getTransferSchemas(metadata: ExchangeMetadata): AnnotatedFunctionABI;
