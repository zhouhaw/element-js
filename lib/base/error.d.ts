/**
 * To simplify typifying ABIs
 */
export interface CustomError {
    name?: string;
    data?: any;
    code: string;
    message?: string;
}
export declare type ElementErrorCodes = Array<Readonly<CustomError>>;
export declare const ErrorCodes: ElementErrorCodes;
export declare class ElementError extends Error {
    code: string;
    constructor(err: CustomError);
}
