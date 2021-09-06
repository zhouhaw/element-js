"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeCallNew = void 0;
var index_1 = require("../../index");
var makeOrder_1 = require("../utils/makeOrder");
var schemaFunctions_1 = require("./schemaFunctions");
var web3_1 = __importDefault(require("web3"));
var web3 = new web3_1.default();
try {
    var schema = makeOrder_1.getSchema(index_1.Network.Private, index_1.ElementSchemaName.ERC1155);
    var asset = {
        tokenId: '72134322679254813612560192230305857957633912505434515263987832391864007262364',
        // The asset's contract address
        tokenAddress: '0x09656BC39B5162012c595c0797740Dc1B0D62E9D',
        // The Element schema name (e.g. "ERC721") for this asset
        schemaName: index_1.ElementSchemaName.ERC1155,
        name: 'ELE',
        data: '' //0x697066733a2f2f516d626261416f6a6876774d514137644c69745a4d424e4e3946786153636b673546395346534c756b6d6667416f2f6d2e6a736f6e
    };
    var elementAsset = makeOrder_1.getElementAsset(schema, asset, index_1.makeBigNumber(1));
    var transfer = schema.functions.transfer(elementAsset);
    var callData = schemaFunctions_1.encodeDefaultCall(transfer, '0x9F7A946d935c8Efc7A8329C0d894A69bA241345A');
    console.log(callData);
    var pattern = schemaFunctions_1.encodeReplacementPattern(transfer);
    console.log(pattern);
}
catch (e) {
    console.log('ll', e);
}
var encodeCallNew = function (abi, parameters) {
    // let methodID = web3.eth.abi.encodeFunctionSignature(abi)
    var callData = web3.eth.abi.encodeFunctionCall(abi, parameters);
    // console.log("methodID",callData)
    return callData;
    // case FunctionInputKind.Data:
    //         return input.value == '' ? '0x' : input.value
};
exports.encodeCallNew = encodeCallNew;
