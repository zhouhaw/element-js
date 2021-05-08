"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeDefaultCall = exports.encodeBuy = exports.encodeSell = exports.encodeCall = void 0;
// import { BigNumber } from 'bignumber.js';
var ethABI = require('ethereumjs-abi');
// import * as Web3 from 'web3';
// import { WyvernProtocol } from 'wyvern-js';
// import { WyvernAtomicizerContract } from 'wyvern-js/lib/abi_gen/wyvern_atomicizer';
var types_1 = require("./types");
var failWith = function (msg) {
    throw new Error(msg);
};
// export const encodeReplacementPattern = WyvernProtocol.encodeReplacementPattern;
var generateDefaultValue = function (type) {
    switch (type) {
        case 'address':
        case 'bytes20':
            /* Null address is sometimes checked in transfer calls. */
            // But we need to use 0x000 because bitwise XOR won't work if there's a 0 in the actual address, since it will be replaced as 1 OR 0 = 1
            return '0x0000000000000000000000000000000000000000';
        case 'bytes32':
            return '0x0000000000000000000000000000000000000000000000000000000000000000';
        case 'bool':
            return false;
        case 'int':
        case 'uint':
        case 'uint8':
        case 'uint16':
        case 'uint32':
        case 'uint64':
        case 'uint256':
            return 0;
        default:
            throw new Error('Default value not yet implemented for type: ' + type);
    }
};
var encodeReplacementPattern = function (abi, replaceKind, encodeToBytes) {
    if (replaceKind === void 0) { replaceKind = types_1.FunctionInputKind.Replaceable; }
    if (encodeToBytes === void 0) { encodeToBytes = true; }
    var output = [];
    var data = [];
    var dynamicOffset = abi.inputs.reduce(function (len, _a) {
        var type = _a.type;
        var match = type.match(/\[(.+)\]$/);
        return len + (match ? parseInt(match[1], 10) * 32 : 32);
    }, 0);
    abi.inputs
        .map(function (_a) {
        var kind = _a.kind, type = _a.type, value = _a.value;
        return ({
            bitmask: kind === replaceKind ? 255 : 0,
            type: ethABI.elementaryName(type),
            value: value !== undefined ? value : generateDefaultValue(type),
        });
    })
        .reduce(function (offset, _a) {
        var bitmask = _a.bitmask, type = _a.type, value = _a.value;
        // The 0xff bytes in the mask select the replacement bytes. All other bytes are 0x00.
        var cur = new Buffer(ethABI.encodeSingle(type, value).length).fill(bitmask);
        if (ethABI.isDynamic(type)) {
            if (bitmask) {
                throw new Error('Replacement is not supported for dynamic parameters.');
            }
            output.push(new Buffer(ethABI.encodeSingle('uint256', dynamicOffset).length));
            data.push(cur);
            return offset + cur.length;
        }
        output.push(cur);
        return offset;
    }, dynamicOffset);
    // 4 initial bytes of 0x00 for the method hash.
    var methodIdMask = new Buffer(4);
    var mask = Buffer.concat([methodIdMask, Buffer.concat(output.concat(data))]);
    return encodeToBytes ? "0x" + mask.toString('hex') : mask.map(function (b) { return b ? 1 : 0; }).join('');
};
var encodeCall = function (abi, parameters) {
    var inputTypes = abi.inputs.map(function (i) { return i.type; });
    return '0x' + Buffer.concat([
        ethABI.methodID(abi.name, inputTypes),
        ethABI.rawEncode(inputTypes, parameters),
    ]).toString('hex');
};
exports.encodeCall = encodeCall;
var encodeSell = function (schema, asset, address) {
    var transfer = schema.functions.transfer(asset);
    return {
        target: transfer.target,
        dataToCall: exports.encodeDefaultCall(transfer, address),
        replacementPattern: encodeReplacementPattern(transfer),
    };
};
exports.encodeSell = encodeSell;
var encodeBuy = function (schema, asset, address) {
    var transfer = schema.functions.transfer(asset);
    var replaceables = transfer.inputs.filter(function (i) { return i.kind === types_1.FunctionInputKind.Replaceable; });
    var ownerInputs = transfer.inputs.filter(function (i) { return i.kind === types_1.FunctionInputKind.Owner; });
    // Validate
    if (replaceables.length !== 1) {
        failWith('Only 1 input can match transfer destination, but instead ' + replaceables.length + ' did');
    }
    // Compute calldata
    var parameters = transfer.inputs.map(function (input) {
        switch (input.kind) {
            case types_1.FunctionInputKind.Replaceable:
                return address;
            case types_1.FunctionInputKind.Owner:
                return generateDefaultValue(input.type);
            default:
                return input.value.toString();
        }
    });
    var dataToCall = exports.encodeCall(transfer, parameters);
    // Compute replacement pattern
    var replacementPattern = '0x';
    if (ownerInputs.length > 0) {
        replacementPattern = encodeReplacementPattern(transfer, types_1.FunctionInputKind.Owner);
    }
    return {
        target: transfer.target,
        dataToCall: dataToCall,
        replacementPattern: replacementPattern,
    };
};
exports.encodeBuy = encodeBuy;
var encodeDefaultCall = function (abi, address) {
    var parameters = abi.inputs.map(function (input) {
        switch (input.kind) {
            case types_1.FunctionInputKind.Replaceable:
                return generateDefaultValue(input.type);
            case types_1.FunctionInputKind.Owner:
                return address;
            case types_1.FunctionInputKind.Asset:
            case types_1.FunctionInputKind.Count:
            default:
                return input.value;
        }
    });
    return exports.encodeCall(abi, parameters);
};
exports.encodeDefaultCall = encodeDefaultCall;