"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersApi = exports.AssetsApi = exports.GqlApi = void 0;
var assetsApi_1 = require("./assetsApi");
Object.defineProperty(exports, "AssetsApi", { enumerable: true, get: function () { return assetsApi_1.AssetsApi; } });
var usersApi_1 = require("./usersApi");
Object.defineProperty(exports, "UsersApi", { enumerable: true, get: function () { return usersApi_1.UsersApi; } });
exports.GqlApi = {
    assetsApi: assetsApi_1.AssetsApi,
    usersApi: usersApi_1.UsersApi
};
