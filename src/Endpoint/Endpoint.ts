class Endpoint {
    public readonly method: string;
    public readonly path: string;
    public readonly file?: string;
    public readonly line?: number;
    public readonly normalizedPath: string;

    /**
     * Constructor for the Endpoint class
     *
     * @param {String} method The HTTP method of the endpoint
     * @param {String} path The path of the endpoint
     * @param {String|undefined} file File where the path controller is defined
     * @param {Number|undefined} line Line in the file where the path controller is defined
     */
    constructor(method: string, path: string, file?: string, line?: number) {
        method = method.toUpperCase();
        if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            throw new Error(`Invalid method: ${method}`);
        }

        this.method = method;
        this.path = path;
        this.file = file;
        this.line = line;
        this.normalizedPath = this.normalizePath(path);
    }

    /**
     * Normalizes the path of the endpoint
     *
     * @param path The path of the endpoint
     * @returns The normalized path
     */
    private normalizePath(path: string): string {
        return path.trim().toLowerCase().replace(/\{[^{]+}/g, '{param}');
    }

    /**
     * Checks if the current endpoint is equal to another endpoint
     *
     * @param endpoint The endpoint to compare to
     * @returns True if the endpoints are equal, false otherwise
     */
    public equals(endpoint: Endpoint): boolean {
        return endpoint.method === this.method && endpoint.normalizedPath === this.normalizedPath;
    }
}

export default Endpoint;
