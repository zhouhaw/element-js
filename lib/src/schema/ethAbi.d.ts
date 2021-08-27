/// <reference types="node" />
interface ABICoder {
    eventID: (name: string, types: Array<any>) => Buffer;
    methodID: (name: string, types: Array<any>) => Buffer;
    rawEncode: (types: Array<any>, values: Array<any>) => Buffer;
    simpleEncode: (method: string) => Buffer;
}
export declare function elementaryName(name: string): string;
export declare function encodeSingle(type: any, arg: any): Buffer;
export declare function isDynamic(type: string): boolean;
export declare const ABI: ABICoder;
export {};
