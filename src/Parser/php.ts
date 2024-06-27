import {exec} from '@actions/exec';
import {join, resolve, sep} from 'node:path';
import EndpointCollection from '../Endpoint/EndpointCollection';
import {parseOutput, ParserInterface} from './index';
import RouteFilterInterface from "../RouteFilter/RouteFilterInterface";

const phpParser = async function (
    collection: EndpointCollection,
    path: string,
    routeFilter: RouteFilterInterface | null,
    app: string
): Promise<number> {
    const paths = __dirname.split(sep);
    let cwd = resolve(__dirname, '..');
    if (paths.pop() !== 'dist') {
        cwd = resolve(cwd, '..');
    }
    cwd = join(cwd, 'parsers', 'php');

    // Generating autoload file
    await exec(
        'composer',
        ['dump-autoload', '--no-dev', '--no-interaction', '--quiet'],
        {
            cwd,
        }
    );

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
