"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElementRegistrySchemas = void 0;
var types_1 = require("../../../types");
exports.ElementRegistrySchemas = {
    address: '',
    functions: {
        transfer: function (asset) { return ({
            type: types_1.AbiType.Function,
            name: 'registerProxy',
            payable: false,
            constant: false,
            stateMutability: types_1.StateMutability.Nonpayable,
            target: asset.address,
            inputs: [],
            outputs: []
        }); },
        isApprove: function (asset) { return ({
            type: types_1.AbiType.Function,
            name: 'proxies',
            payable: false,
            constant: true,
            stateMutability: types_1.StateMutability.View,
            target: asset.address,
            inputs: [{ kind: types_1.FunctionInputKind.Owner, name: 'account', type: 'address' }],
            outputs: [{ kind: types_1.FunctionOutputKind.Other, name: 'proxy', type: 'address' }]
        }); }
    }
};
