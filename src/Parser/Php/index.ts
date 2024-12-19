import EndpointCollection from '../../Endpoint/EndpointCollection';
import RouteFilterInterface from '../../RouteFilter/RouteFilterInterface';
import {exec} from '@actions/exec';
import {existsSync} from 'node:fs';
import {getParserDir} from '../baseParser';
import {join} from 'node:path';
import {parseOutput, ParserInterface} from '../';

const phpParser = async function (
    collection: EndpointCollection,
    path: string,
    routeFilter: RouteFilterInterface | null,
    app: string
): Promise<number> {
    const cwd = getParserDir('php');

    // Generating autoload file
    if (!existsSync(join(cwd, 'vendor', 'autoload.php'))) {
        await exec(
            'composer',
            ['dump-autoload', '--no-dev', '--no-interaction', '--quiet'],
            {
                cwd,
            }
        );
    }

    let discovered = 0;
    let stderr = '';
    const exitCode = await exec(
        'php',
        ['parser.php', '--app', app, '--path', path],
        {
            cwd,
            ignoreReturnCode: true,
            silent: true,
            listeners: {
                stdout: (data: Buffer): void => {
                    discovered += parseOutput(data, collection, routeFilter);
                },
                stderr: (data: Buffer): void => {
                    stderr += data.toString('utf8');
                },
            },
        }
    );

    if ((exitCode !== 0) || (stderr.length > 0)) {
        throw new Error(`Error ${exitCode} when executing Laravel Parser: ${stderr}`);
    }

    return discovered;
}

export const laravelParser: ParserInterface = async function (
    collection: EndpointCollection,
    path: string,
    routeFilter: RouteFilterInterface | null
): Promise<number> {
    return phpParser(collection, path, routeFilter, 'laravel');
}
