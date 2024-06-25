import EndpointCollection from '../Endpoint/EndpointCollection';
import Endpoint from "../Endpoint/Endpoint";
import RouteFilterInterface from "../RouteFilter/RouteFilterInterface";

export type ParserInterface = (
    collection: EndpointCollection,
    path: string,
    routeFilter: RouteFilterInterface | null
) => Promise<number>;

const addEndpointIntoCollection = (
    parts: string[],
    collection: EndpointCollection,
    routeFilter: RouteFilterInterface | null
): boolean => {
    const [, method, uri, file, line] = parts;
    if ((routeFilter === null) || (routeFilter.filter(method, uri))) {
        collection.add(new Endpoint(method, uri, file, (line) ? Number(line) : null));
        return true;
    }

    return false;
}


export const parseOutput = (
    data: Buffer,
    collection: EndpointCollection,
    routeFilter: RouteFilterInterface | null
): number => {
    let discovered = 0;

    const buffered = data.toString('utf8');
    const lines = buffered.split('\n');
    for (const line of lines) {
        const parts = line.split('\t');
        if (!parts[0]) {
            continue;
        }
        switch (parts[0]) {
            case 'endpoint':
                if (addEndpointIntoCollection(parts, collection, routeFilter)) {
                    discovered++;
                }
                break;
            default:
                console.error('unknown', line);
        }
    }

    return discovered;
}
