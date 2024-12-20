import EndpointCollection from '../../Endpoint/EndpointCollection';
import RouteFilterInterface from '../../RouteFilter/RouteFilterInterface';
import {exec} from '@actions/exec';
import {existsSync} from 'node:fs';
import {getParserDir, runCommand} from '../baseParser';
import {join} from 'node:path';
import {parseOutput, ParserInterface} from '../';

const phpParser: ParserInterface = async function (
    collection: EndpointCollection,
    path: string,
    routeFilter: RouteFilterInterface | null,
): Promise<number> {
    const cwd = getParserDir('php');

    // Generating autoload file
    if (!existsSync(join(cwd, 'vendor', 'autoload.php'))) {
        await exec(
            'composer',
            ['dump-autoload', '--optimize', '--no-dev', '--no-interaction', '--quiet'],
            {
                cwd,
            }
        );
    }

    return await runCommand(
        'php',
        ['parser.php', '--path', path],
        cwd,
        collection,
        routeFilter,
    );
}

export default phpParser;
