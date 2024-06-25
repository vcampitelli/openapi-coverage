import Endpoint from './Endpoint';

interface EndpointMatching {
    endpoint: Endpoint;
    matched: boolean;
}

class EndpointCollection {
    private endpoints: Map<string, EndpointMatching> = new Map();

    add(endpoint: Endpoint): EndpointCollection {
        const key: string = `${endpoint.method}_${endpoint.normalizedPath}`;

        const matching = this.endpoints.get(key);
        if (matching === undefined) {
            this.endpoints.set(key, {
                endpoint: endpoint,
                matched: false
            });
            return this;
        }

        matching.matched = true;
        return this;
    }

    *getUnmatchedEndpoints() {
        for (const [, matching] of this.endpoints) {
            if (!matching.matched) {
                yield matching.endpoint;
            }
        }
    }
}

export default EndpointCollection;
