"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENSNameBaseSchema = exports.nodehash = exports.namehash = void 0;
var web3_1 = __importDefault(require("web3"));
var namehash = function (name) {
    var node = '0000000000000000000000000000000000000000000000000000000000000000';
    if (name !== '') {
        var labels = name.split('.');
        for (var i = labels.length - 1; i >= 0; i--) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            var substr = web3_1.default.utils.sha3(labels[i]).substr;
            node = web3_1.default.utils.sha3(node + substr(2));
        }
    }
    return '0x' + node;
};
exports.namehash = namehash;
var nodehash = function (name) {
    var label = name.split('.')[0];
    if (label) {
        return web3_1.default.utils.sha3(label);
    }
    else {
        return '';
    }
};
exports.nodehash = nodehash;
exports.ENSNameBaseSchema = {
    fields: [
        { name: 'Name', type: 'string', description: 'ENS Name' },
        {
            name: 'NodeHash',
            type: 'bytes32',
            description: 'ENS Node Hash',
            readOnly: true
        },
        {
            name: 'NameHash',
            type: 'bytes32',
            description: 'ENS Name Hash',
            readOnly: true
        }
    ],
    assetFromFields: function (fields) { return ({
        id: fields.ID,
        address: fields.Address,
        name: fields.Name,
        nodeHash: exports.nodehash(fields.Name),
        nameHash: exports.namehash(fields.Name)
    }); },
    checkAsset: function (asset) {
        return asset.name ? exports.namehash(asset.name) === asset.nameHash && exports.nodehash(asset.name) === asset.nodeHash : true;
    },
    hash: function (_a) {
        var nodeHash = _a.nodeHash;
        return nodeHash;
    }
};
