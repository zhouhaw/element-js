"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.privateSchemas = void 0;
var ERC1155_1 = require("../ERC1155");
var ERC20_1 = require("../ERC20");
var ERC721_1 = require("../ERC721");
var elementShard_1 = require("./elementShard");
// import { ERC20Schema } from '@utils/orders/schema/schemas/ERC20'
exports.privateSchemas = [
    elementShard_1.privateElementShardSchema,
    ERC20_1.ERC20Schema,
    ERC721_1.ERC721Schema,
    ERC1155_1.ERC1155Schema
];
