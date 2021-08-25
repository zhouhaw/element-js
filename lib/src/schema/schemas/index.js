"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemas = void 0;
var rinkeby_1 = require("./rinkeby");
var private_1 = require("./private");
var main_1 = require("./main");
var mumbai_1 = require("./mumbai");
var polygon_1 = require("./polygon");
exports.schemas = {
    rinkeby: rinkeby_1.rinkebySchemas,
    private: private_1.privateSchemas,
    main: main_1.mainSchemas,
    mumbai: mumbai_1.mumbaiSchemas,
    polygon: polygon_1.polygonSchemas
};
