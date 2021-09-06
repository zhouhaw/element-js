"use strict";
//
// export const CHECK_ETH_BALANCE = false
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_BASE_URL = exports.CHAIN = exports.CHAIN_ID = void 0;
var index_1 = require("../../index");
exports.CHAIN_ID = (_a = {},
    _a[index_1.Network.Private] = 100,
    _a[index_1.Network.Main] = 1,
    _a[index_1.Network.Rinkeby] = 4,
    _a[index_1.Network.Polygon] = 137,
    _a[index_1.Network.Mumbai] = 80001,
    _a);
exports.CHAIN = (_b = {},
    _b[index_1.Network.Private] = 'eth',
    _b[index_1.Network.Main] = 'eth',
    _b[index_1.Network.Rinkeby] = 'eth',
    _b[index_1.Network.Polygon] = 'polygon',
    _b[index_1.Network.Mumbai] = 'polygon',
    _b);
exports.API_BASE_URL = (_c = {},
    _c[index_1.Network.Main] = {
        api: 'https://element-api.eossql.com',
        key: 'zQbYj7RhC1VHIBdWU63ki5AJKXloamDT',
        secret: 'UqCMpfGn3VyQEdsjLkzJv9tNlgbKFD7O'
    },
    _c[index_1.Network.Rinkeby] = {
        api: 'https://element-api-test.eossql.com',
        key: 'ysBokbA3gKUzt61DmeHWjTFYZ07CGPQL',
        secret: 'a2PAJXRBChdpGvoyKEz3lLS5Yf1bM0NO'
    },
    _c[index_1.Network.Mumbai] = {
        api: 'https://element-api-test.eossql.com',
        key: 'ysBokbA3gKUzt61DmeHWjTFYZ07CGPQL',
        secret: 'a2PAJXRBChdpGvoyKEz3lLS5Yf1bM0NO'
    },
    _c[index_1.Network.Polygon] = {
        api: 'https://element-api.eossql.com',
        key: 'zQbYj7RhC1VHIBdWU63ki5AJKXloamDT',
        secret: 'UqCMpfGn3VyQEdsjLkzJv9tNlgbKFD7O'
    },
    _c);
