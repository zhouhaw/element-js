export declare const schemas: {
    rinkeby: import("../types").Schema<any>[];
    private: import("../types").Schema<any>[];
    main: import("../types").Schema<any>[];
    mumbai: import("../types").Schema<any>[];
    polygon: import("../types").Schema<any>[];
};
export declare const common: {
    ElementSchemas: Required<Pick<import("../types").Schema<import("./common/Element").Exchange>, "functions">>;
    ERC20Schema: import("../types").Schema<import("./common/ERC20").FungibleTradeType>;
    ERC721Schema: import("../types").Schema<import("./common/ERC721").NonFungibleContractType>;
    ERC1155Schema: import("../types").Schema<import("./common/ERC1155").SemiFungibleTradeType>;
};
