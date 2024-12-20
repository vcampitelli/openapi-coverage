import {ParserInterface} from '../';
import EndpointCollection from '../../Endpoint/EndpointCollection';
import RouteFilterInterface from '../../RouteFilter/RouteFilterInterface';
import {getParserDir, runCommand} from '../baseParser';

const nodeParser: ParserInterface = async (
    collection: EndpointCollection,
    path: string,
    routeFilter: RouteFilterInterface | null
): Promise<number> => {
    const cwd = getParserDir('node');

    return await runCommand(
        'node',
        ['parser.js', path],
        cwd,
        collection,
        routeFilter,
    );
};

export default nodeParser;
