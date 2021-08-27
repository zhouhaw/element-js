"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElementSchemas = void 0;
var types_1 = require("../../../types");
var exchangeAddress = '';
var registryAddress = '';
exports.ElementSchemas = {
    functions: {
        transfer: function (asset) { return ({
            type: types_1.AbiType.Function,
            name: 'orderMatch',
            payable: false,
            constant: false,
            stateMutability: types_1.StateMutability.Nonpayable,
            target: exchangeAddress,
            inputs: [
                { kind: types_1.FunctionInputKind.Data, name: 'buy', type: 'address', value: asset.sell },
                { kind: types_1.FunctionInputKind.Data, name: 'buySig', type: 'address', value: asset.sellSig },
                { kind: types_1.FunctionInputKind.Data, name: 'sell', type: 'bytes', value: asset.buy },
                { kind: types_1.FunctionInputKind.Data, name: 'sellSig', type: 'bytes', value: asset.buySig }
            ],
            outputs: []
        }); },
        isApprove: function (asset) { return ({
            type: types_1.AbiType.Function,
            name: 'proxies',
            payable: false,
            constant: true,
            stateMutability: types_1.StateMutability.View,
            target: registryAddress,
            inputs: [{ kind: types_1.FunctionInputKind.Owner, name: 'account', type: 'address', value: asset.account }],
            outputs: [{ kind: types_1.FunctionOutputKind.Owner, name: 'proxy', type: 'address' }]
        }); },
        approve: function () { return ({
            type: types_1.AbiType.Function,
            name: 'registerProxy',
            payable: false,
            constant: false,
            stateMutability: types_1.StateMutability.Nonpayable,
            target: registryAddress,
            inputs: [],
            outputs: []
        }); }
    }
};
