"use strict";
// To help typescript find the type 
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokens = void 0;
var main_1 = require("./main");
var rinkeby_1 = require("./rinkeby");
var private_1 = require("./private");
exports.tokens = {
    rinkeby: rinkeby_1.rinkebyTokens,
    main: main_1.mainTokens,
    private: private_1.privateTokens
};
