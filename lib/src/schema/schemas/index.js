"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransferSchemas = exports.getApproveSchemas = exports.getIsApproveSchemas = exports.getBalanceSchemas = exports.common = exports.schemas = void 0;
var rinkeby_1 = require("./rinkeby");
var private_1 = require("./private");
var main_1 = require("./main");
var mumbai_1 = require("./mumbai");
var polygon_1 = require("./polygon");
var registry_1 = require("./common/Element/registry");
var exchange_1 = require("./common/Element/exchange");
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
exports.common = {
    ElementRegistrySchemas: registry_1.ElementRegistrySchemas,
    ElementExchangeSchemas: exchange_1.ElementExchangeSchemas,
    ERC20Schema: ERC20_1.ERC20Schema,
    ERC721Schema: ERC721_1.ERC721Schema,
    ERC1155Schema: ERC1155_1.ERC1155Schema
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
function getTransferSchemas(metadata) {
    // const address = asset.tokenAddress
    // const tokneId = asset.tokenId
    // const schema = asset.schemaName
    var address = metadata.asset.address;
    var data = '0x';
    var quantity;
    if ('quantity' in metadata.asset) {
        quantity = metadata.asset.quantity;
    }
    if ('data' in metadata.asset) {
        data = metadata.asset.data || data;
    }
    var tokneId = metadata.asset.id;
    var schema = metadata.schema;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    var accountApprove = ERC1155_1.ERC1155Schema.functions.transfer({ address: address, id: tokneId, quantity: quantity, data: data });
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
    if (schema === types_1.ElementSchemaName.ERC1155) {
        if (!data) {
            // accountApprove.inputs = accountApprove.inputs.filter((val) => val.name != '_data')
        }
    }
    // accountApprove.target = to
    return accountApprove;
}
exports.getTransferSchemas = getTransferSchemas;
