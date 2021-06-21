"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.privateElementShardSchema = void 0;
var types_1 = require("../../../types");
exports.privateElementShardSchema = {
    version: 1,
    deploymentBlock: 0,
    name: 'ElementShardType',
    description: 'Element ERC1155 non-fungible token for Element Exchange testing',
    thumbnail: 'https://cointelegraph.com/storage/uploads/view/f88e17e41f607dc0aef238230dd40cc6.png',
    website: 'https://element.market',
    fields: [
        { name: 'ID', type: 'uint256', description: 'Asset Token ID' },
        { name: 'Address', type: 'address', description: 'Asset Contract Address' },
        { name: 'Quantity', type: 'uint256', description: 'Quantity to transfer' }
    ],
    assetFromFields: function (fields) { return ({
        id: fields.ID,
        quantity: fields.Quantity,
        address: fields.Address
    }); },
    assetToFields: function (asset) { return ({
        ID: asset.id,
        Address: asset.address,
        Quantity: asset.quantity
    }); },
    formatter: function (asset) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, {
                    thumbnail: 'https://cointelegraph.com/storage/uploads/view/f88e17e41f607dc0aef238230dd40cc6.png',
                    title: 'ElementShard #' + asset,
                    description: 'Element ERC1155 NFT!',
                    url: 'https://www.element.market',
                    properties: []
                }];
        });
    }); },
    functions: {
        transfer: function (asset) { return ({
            type: types_1.AbiType.Function,
            name: 'safeTransferFrom',
            payable: false,
            constant: false,
            stateMutability: types_1.StateMutability.Nonpayable,
            target: '',
            inputs: [
                { kind: types_1.FunctionInputKind.Owner, name: '_from', type: 'address' },
                { kind: types_1.FunctionInputKind.Replaceable, name: '_to', type: 'address' },
                { kind: types_1.FunctionInputKind.Asset, name: '_id', type: 'uint256', value: asset.id },
                { kind: types_1.FunctionInputKind.Count, name: '_amount', type: 'uint256', value: asset.quantity },
                { kind: types_1.FunctionInputKind.Data, name: '_data', type: 'bytes', value: '' }
            ],
            outputs: []
        }); },
        ownerOf: function (asset) { return ({
            type: types_1.AbiType.Function,
            name: 'ownerOf',
            payable: false,
            constant: true,
            stateMutability: types_1.StateMutability.View,
            target: '',
            inputs: [{ kind: types_1.FunctionInputKind.Asset, name: '_tokenId', type: 'uint256', value: asset.id }],
            outputs: [{ kind: types_1.FunctionOutputKind.Owner, name: '_owner', type: 'address' }]
        }); },
        assetsOfOwnerByIndex: []
    },
    events: {
        transfer: [
            {
                type: types_1.AbiType.Event,
                name: 'Transfer',
                target: '',
                anonymous: false,
                inputs: [
                    { kind: types_1.EventInputKind.Source, indexed: true, name: '_from', type: 'address' },
                    { kind: types_1.EventInputKind.Destination, indexed: true, name: '_to', type: 'address' },
                    { kind: types_1.EventInputKind.Asset, indexed: false, name: '_tokenId', type: 'uint256' }
                ],
                assetFromInputs: function (inputs) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                    return [2 /*return*/, inputs._tokenId.toString()];
                }); }); }
            }
        ]
    },
    hash: function (a) { return a; }
};
