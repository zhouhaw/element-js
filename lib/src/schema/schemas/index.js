"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.common = exports.schemas = void 0;
var rinkeby_1 = require("./rinkeby");
var private_1 = require("./private");
var main_1 = require("./main");
var mumbai_1 = require("./mumbai");
var polygon_1 = require("./polygon");
var Element_1 = require("./common/Element");
var ERC20_1 = require("./common/ERC20");
var ERC721_1 = require("./common/ERC721");
var ERC1155_1 = require("./common/ERC1155");
exports.schemas = {
    rinkeby: rinkeby_1.rinkebySchemas,
    private: private_1.privateSchemas,
    main: main_1.mainSchemas,
    mumbai: mumbai_1.mumbaiSchemas,
    polygon: polygon_1.polygonSchemas
};
exports.common = {
    ElementSchemas: Element_1.ElementSchemas,
    ERC20Schema: ERC20_1.ERC20Schema,
    ERC721Schema: ERC721_1.ERC721Schema,
    ERC1155Schema: ERC1155_1.ERC1155Schema
};
