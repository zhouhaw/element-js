"use strict";
// To help typescript find the type
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokens = void 0;
var main_1 = require("./main");
var rinkeby_1 = require("./rinkeby");
var private_1 = require("./private");
var mumbai_1 = require("./mumbai");
var polygon_1 = require("./polygon");
exports.tokens = {
    rinkeby: rinkeby_1.rinkebyTokens,
    main: main_1.mainTokens,
    private: private_1.privateTokens,
    mumbai: mumbai_1.mumbaiTokens,
    polygon: polygon_1.polygonTokens
};
