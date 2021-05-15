/**
 * To simplify typifying ABIs
 */
export interface CustomError {
    name?: string;
    data?: any;
    code: number;
    message?: string;
}
export declare type ElementErrorCodes = Array<Readonly<CustomError>>;
export declare const ErrorCodes: ElementErrorCodes;
export declare class ElementError extends Error {
    code: number;
    constructor(err: CustomError);
}
