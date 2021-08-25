"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventInputKind = exports.FunctionOutputKind = exports.StateMutability = exports.ABIType = exports.AbiType = exports.Network = exports.FunctionInputKind = void 0;
//-- 'wyvern-js/lib/types';
var FunctionInputKind;
(function (FunctionInputKind) {
    FunctionInputKind["Replaceable"] = "replaceable";
    FunctionInputKind["Asset"] = "asset";
    FunctionInputKind["Owner"] = "owner";
    FunctionInputKind["Index"] = "index";
    FunctionInputKind["Count"] = "count";
    FunctionInputKind["Data"] = "data";
})(FunctionInputKind = exports.FunctionInputKind || (exports.FunctionInputKind = {}));
//-------
var Network;
(function (Network) {
    Network["Main"] = "main";
    Network["Rinkeby"] = "rinkeby";
    Network["Private"] = "private";
    Network["Polygon"] = "polygon";
    Network["Mumbai"] = "mumbai";
})(Network = exports.Network || (exports.Network = {}));
// export enum NetworkID {
//   Main = '4',
//   Rinkeby = '7',
//   Private = '100'
// }
var AbiType;
(function (AbiType) {
    AbiType["Function"] = "function";
    AbiType["Constructor"] = "constructor";
    AbiType["Event"] = "event";
    AbiType["Fallback"] = "fallback";
})(AbiType = exports.AbiType || (exports.AbiType = {}));
var ABIType;
(function (ABIType) {
    ABIType["Function"] = "function";
    ABIType["Event"] = "event";
})(ABIType = exports.ABIType || (exports.ABIType = {}));
var StateMutability;
(function (StateMutability) {
    StateMutability["Pure"] = "pure";
    StateMutability["View"] = "view";
    StateMutability["Payable"] = "payable";
    StateMutability["Nonpayable"] = "nonpayable";
})(StateMutability = exports.StateMutability || (exports.StateMutability = {}));
var FunctionOutputKind;
(function (FunctionOutputKind) {
    FunctionOutputKind["Owner"] = "owner";
    FunctionOutputKind["Asset"] = "asset";
    FunctionOutputKind["Count"] = "count";
    FunctionOutputKind["Other"] = "other";
})(FunctionOutputKind = exports.FunctionOutputKind || (exports.FunctionOutputKind = {}));
var EventInputKind;
(function (EventInputKind) {
    EventInputKind["Source"] = "source";
    EventInputKind["Destination"] = "destination";
    EventInputKind["Asset"] = "asset";
    EventInputKind["Other"] = "other";
})(EventInputKind = exports.EventInputKind || (exports.EventInputKind = {}));
