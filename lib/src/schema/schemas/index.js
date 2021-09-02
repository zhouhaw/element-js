"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.common = exports.getTransferSchemas = exports.getApproveSchemas = exports.getIsApproveSchemas = exports.getBalanceSchemas = exports.schemas = void 0;
var rinkeby_1 = require("./rinkeby");
var private_1 = require("./private");
var main_1 = require("./main");
var mumbai_1 = require("./mumbai");
var polygon_1 = require("./polygon");
var Element_1 = require("./common/Element");
var ERC20_1 = require("./common/ERC20");
var ERC721_1 = require("./common/ERC721");
var ERC1155_1 = require("./common/ERC1155");
var CryptoKitties_1 = require("./common/CryptoKitties");
var types_1 = require("../../types");
exports.schemas = {
    rinkeby: rinkeby_1.rinkebySchemas,
    private: private_1.privateSchemas,
    main: main_1.mainSchemas,
    mumbai: mumbai_1.mumbaiSchemas,
    polygon: polygon_1.polygonSchemas
};
function getBalanceSchemas(metadata) {
    var address = metadata.asset.address;
    var tokneId = metadata.asset.id;
    var schema = metadata.schema;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    var accountApprove = ERC1155_1.ERC1155Schema.functions.countOf({ address: address, id: tokneId });
    if (schema === types_1.ElementSchemaName.ERC721) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        accountApprove = ERC721_1.ERC721Schema.functions.ownerOf({ address: address });
    }
    if (schema === types_1.ElementSchemaName.CryptoKitties) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        accountApprove = CryptoKitties_1.CryptoKittiesSchema.functions.ownerOf({ address: address, id: tokneId });
    }
    return accountApprove;
}
exports.getBalanceSchemas = getBalanceSchemas;
function getIsApproveSchemas(metadata) {
    var address = metadata.asset.address;
    var tokneId = metadata.asset.id;
    var schema = metadata.schema;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    var accountApprove = ERC1155_1.ERC1155Schema.functions.isApprove({ address: address });
    if (schema === types_1.ElementSchemaName.ERC721) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        accountApprove = ERC721_1.ERC721Schema.functions.isApprove({ address: address });
    }
    if (schema === types_1.ElementSchemaName.CryptoKitties) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        accountApprove = CryptoKitties_1.CryptoKittiesSchema.functions.isApprove({ address: address, id: tokneId });
    }
    return accountApprove;
}
exports.getIsApproveSchemas = getIsApproveSchemas;
function getApproveSchemas(metadata) {
    var address = metadata.asset.address;
    var tokneId = metadata.asset.id;
    var schema = metadata.schema;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    var accountApprove = ERC1155_1.ERC1155Schema.functions.approve({ address: address });
    if (schema === types_1.ElementSchemaName.ERC721) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        accountApprove = ERC721_1.ERC721Schema.functions.approve({ address: address });
    }
    if (schema === types_1.ElementSchemaName.CryptoKitties) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        accountApprove = CryptoKitties_1.CryptoKittiesSchema.functions.approve({ id: tokneId, address: address });
    }
    // accountApprove.target = to
    return accountApprove;
}
exports.getApproveSchemas = getApproveSchemas;
function getTransferSchemas(asset) {
    var address = asset.tokenAddress;
    var tokneId = asset.tokenId;
    var schema = asset.schemaName;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    var accountApprove = ERC1155_1.ERC1155Schema.functions.transfer({ address: address, id: tokneId });
    if (schema === types_1.ElementSchemaName.ERC721) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        accountApprove = ERC721_1.ERC721Schema.functions.transfer({ address: address, id: tokneId });
    }
    if (schema === types_1.ElementSchemaName.CryptoKitties) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        accountApprove = CryptoKitties_1.CryptoKittiesSchema.functions.transfer({ address: address, id: tokneId });
    }
    // accountApprove.target = to
    return accountApprove;
}
exports.getTransferSchemas = getTransferSchemas;
exports.common = {
    ElementSchemas: Element_1.ElementSchemas,
    ERC20Schema: ERC20_1.ERC20Schema,
    ERC721Schema: ERC721_1.ERC721Schema,
    ERC1155Schema: ERC1155_1.ERC1155Schema
};
