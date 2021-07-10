"use strict";
// To help typescript find the type
// import { Schema } from '../../types';
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemas = void 0;
var rinkeby_1 = require("./rinkeby");
var private_1 = require("./private");
var main_1 = require("./main");
exports.schemas = {
    rinkeby: rinkeby_1.rinkebySchemas,
    private: private_1.privateSchemas,
    main: main_1.mainSchemas,
};
