class Response {
    private _routesDiscovered: number = 0;
    private _specEndpoints: number = 0;
    private _debugMessages: string[] = [];
    private readonly isDebug: boolean;

    constructor(debug: boolean) {
        this.isDebug = debug;
    }

    public set routesDiscovered(routesDiscovered: number) {
        this._routesDiscovered = routesDiscovered;
    }

    public get routesDiscovered(): number {
        return this._routesDiscovered;
    }

    public set specEndpoints(specEndpoints: number) {
        this._specEndpoints = specEndpoints;
    }

    public get specEndpoints(): number {
        return this._specEndpoints;
    }

    public get percentage(): number {
        return (this.routesDiscovered > 0)
            ? Math.round(this.specEndpoints / this.routesDiscovered * 100)
            : 0;
    }

    public debug(message: string): Response {
        if (this.isDebug) {
            this._debugMessages.push(message);
        }
        return this;
    }

    public get debugMessages(): string[] {
        return this._debugMessages;
    }
}

export default Response;
