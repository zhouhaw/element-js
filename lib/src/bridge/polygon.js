"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var maticjs_1 = require("@maticnetwork/maticjs");
var parentProvider = 'https://goerli.infura.io/v3/393758f6317645be8a1ee94a874e12d9';
var maticProvider = 'https://rpc-mumbai.matic.today';
var maticPOSClient = new maticjs_1.MaticPOSClient({
    network: 'testnet',
    version: 'mumbai',
    parentProvider: parentProvider,
    maticProvider: maticProvider
});
