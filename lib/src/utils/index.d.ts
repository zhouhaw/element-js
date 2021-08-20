import { Order } from '../types';
export declare function Sleep(ms: number): Promise<unknown>;
export declare const orderFromJSON: (order: any) => Order;
