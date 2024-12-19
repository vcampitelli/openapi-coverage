import {ParserInterface} from '../index';
import EndpointCollection from '../../Endpoint/EndpointCollection';
import RouteFilterInterface from '../../RouteFilter/RouteFilterInterface';

const expressParser: ParserInterface = async (
    collection: EndpointCollection,
    path: string,
    routeFilter: RouteFilterInterface | null
): Promise<number> => {
    console.log(path);
    return 1;
};

export default expressParser;
