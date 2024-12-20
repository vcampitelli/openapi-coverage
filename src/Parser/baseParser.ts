import {join, resolve, sep} from 'node:path';
import {exec} from '@actions/exec';
import {parseOutput} from './index';
import EndpointCollection from '../Endpoint/EndpointCollection';
import RouteFilterInterface from '../RouteFilter/RouteFilterInterface';

export function getParserDir(folder: string) {
    // const paths = __dirname.split(sep);

    const cwd = resolve(__dirname, '..', '..');
    // if (paths.pop() !== 'dist') {
    //     cwd = resolve(cwd, '..');
    // }
    return join(cwd, 'parsers', folder);
}

export async function runCommand(
    command: string,
    args: string[],
    cwd: string,
    collection: EndpointCollection,
    routeFilter: RouteFilterInterface | null,
) {
    let discovered = 0;
    let stderr = '';
    const exitCode = await exec(
        command,
        args,
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
        throw new Error(`Error ${exitCode} when executing PHP Parser: ${stderr}`);
    }

    return discovered;
}
