"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElementExchangeSchemas = void 0;
var types_1 = require("../../../types");
var exchangeAddress = '';
exports.ElementExchangeSchemas = {
    functions: {
        transfer: function (asset) { return ({
            type: types_1.AbiType.Function,
            name: 'orderMatch',
            payable: false,
            constant: false,
            stateMutability: types_1.StateMutability.Nonpayable,
            target: asset.address,
            inputs: [
                { kind: types_1.FunctionInputKind.Data, name: 'buy', type: 'address', value: asset.sell },
                { kind: types_1.FunctionInputKind.Data, name: 'buySig', type: 'address', value: asset.sellSig },
                { kind: types_1.FunctionInputKind.Data, name: 'sell', type: 'bytes', value: asset.buy },
                { kind: types_1.FunctionInputKind.Data, name: 'sellSig', type: 'bytes', value: asset.buySig }
            ],
            outputs: []
        }); }
    }
};
