"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainSchemas = void 0;
var index_1 = require("../ContractRole/index");
var ERC1155_1 = require("../ERC1155");
var ERC20_1 = require("../ERC20");
var index_2 = require("../ERC721/index");
var index_3 = require("./CryptoKitties/index");
var index_4 = require("./CryptoPunks/index");
var EnjinItem_1 = require("./EnjinItem");
var index_5 = require("./ENSName/index");
var index_6 = require("./ENSShortNameAuction/index");
var index_7 = require("./OwnableContract/index");
exports.mainSchemas = [
    index_3.CryptoKittiesSchema,
    index_4.CryptoPunksSchema,
    index_5.ENSNameSchema,
    index_6.ENSShortNameAuctionSchema,
    index_7.OwnableContractSchema,
    ERC20_1.ERC20Schema,
    index_2.ERC721Schema,
    ERC1155_1.ERC1155Schema,
    EnjinItem_1.EnjinItemSchema,
    index_1.ContractRoleSchema,
];
