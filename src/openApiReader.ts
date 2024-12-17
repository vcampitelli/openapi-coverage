import Parser from '@readme/openapi-parser';
import Endpoint from './Endpoint/Endpoint';
import EndpointCollection from './Endpoint/EndpointCollection';

export default async function openApiReader(
    collection: EndpointCollection,
    filename: string,
): Promise<number> {
    const openapi = await Parser.parse(filename);
    if (!openapi.paths) {
        return 0;
    }

    let prefix = '';
    if (('servers' in openapi) && (openapi.servers)) {
        for (const server of openapi.servers) {
            const url = new URL(server.url);
            if (url.pathname) {
                prefix = url.pathname.replace(/\/+$/, '');
                break;
            }
        }
    }

    let discovered = 0;
    const methods: string[] = ['get', 'post', 'put', 'patch', 'delete'];
    for (const path in openapi.paths) {
        const item = openapi.paths[path];
        if (item === undefined) {
            continue;
        }
        for (const method of methods) {
            if (method in item) {
                discovered++;
                collection.add(
                    new Endpoint(
                        method,
                        prefix + path
                    )
                );
            }
        }
    }

    return discovered;
}
