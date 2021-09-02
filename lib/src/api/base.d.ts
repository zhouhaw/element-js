export declare class Fetch {
    /**
     * Page size to use for fetching orders
     */
    apiBaseUrl: string;
    authToken: string;
    /**
     * Logger function to use when debugging
     */
    logger: (arg: string) => void;
    constructor(url: string, logger?: (arg: string) => void);
    /**
     * Get JSON data from API, sending auth token in headers
     * @param apiPath Path to URL endpoint under API
     * @param query Data to send. Will be stringified using QueryString
     */
    get(url: string): Promise<any>;
    /**
     * POST JSON data to API, sending auth token in headers
     * @param apiPath Path to URL endpoint under API
     * @param body Data to send. Will be JSON.stringified
     * @param opts RequestInit opts, similar to Fetch API. If it contains
     *  a body, it won't be stringified.
     */
    post(apiPath: string, body?: {
        [key: string]: any;
    }, opts?: RequestInit): Promise<any>;
    /**
     * PUT JSON data to API, sending auth token in headers
     * @param apiPath Path to URL endpoint under API
     * @param body Data to send
     * @param opts RequestInit opts, similar to Fetch API. If it contains
     *  a body, it won't be stringified.
     */
    put(apiPath: string, body: any, opts?: RequestInit): Promise<any>;
    /**
     * Get from an API Endpoint, sending auth token in headers
     * @param apiPath Path to URL endpoint under API
     * @param opts RequestInit opts, similar to Fetch API
     */
    private _fetch;
    private _handleApiResponse;
    throwOrContinue(error: Error, retries: number): void;
}
