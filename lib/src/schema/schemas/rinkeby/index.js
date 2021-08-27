"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rinkebySchemas = void 0;
var ERC1155_1 = require("../common/ERC1155");
var ERC20_1 = require("../common/ERC20");
var ERC721_1 = require("../common/ERC721");
var testRinkebyNFT_1 = require("./testRinkebyNFT");
var CryptoKitties_1 = require("./CryptoKitties");
exports.rinkebySchemas = [
    testRinkebyNFT_1.testRinkebyNFTSchema,
    CryptoKitties_1.CryptoKittiesSchema,
    ERC20_1.ERC20Schema,
    ERC721_1.ERC721Schema,
    ERC1155_1.ERC1155Schema
];
