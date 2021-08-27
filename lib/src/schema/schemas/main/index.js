"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainSchemas = void 0;
var index_1 = require("../common/ContractRole/index");
var ERC1155_1 = require("../common/ERC1155");
var ERC20_1 = require("../common/ERC20");
var ERC721_1 = require("../common/ERC721");
var index_2 = require("./CryptoKitties/index");
var index_3 = require("./CryptoPunks/index");
var EnjinItem_1 = require("./EnjinItem");
var index_4 = require("./ENSName/index");
var index_5 = require("./ENSShortNameAuction/index");
var index_6 = require("./OwnableContract/index");
exports.mainSchemas = [
    index_2.CryptoKittiesSchema,
    index_3.CryptoPunksSchema,
    index_4.ENSNameSchema,
    index_5.ENSShortNameAuctionSchema,
    index_6.OwnableContractSchema,
    ERC20_1.ERC20Schema,
    ERC721_1.ERC721Schema,
    ERC1155_1.ERC1155Schema,
    EnjinItem_1.EnjinItemSchema,
    index_1.ContractRoleSchema
];
