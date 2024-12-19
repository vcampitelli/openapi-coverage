import minimist from 'minimist';
import CommandEntrypoint from '../Command/CommandEntrypoint';
import command from '../Command';
import readIgnoreRoutesFile from '../Utils/readIgnoreRoutesFile';
import {resolve} from 'node:path';
import discoverParser from '../Parser/discover';

type Args = Pick<minimist.ParsedArgs, '_' | '--'> & {
    path?: string;
    spec?: string;
    debug?: boolean;
    'ignore-routes-file'?: string;
    'ignore-routes'?: string[];
};

export default async function() {
    const argv = minimist<Args>(process.argv.slice(2));

    const path = argv['path'] || process.cwd();
    const spec = argv['spec'];
    const isDebug = !!argv['debug'] as boolean;
    const ignoreRoutes = (function (): string[] {
        const ignoreRoutesFile = argv['ignore-routes-file'];
        if (ignoreRoutesFile) {
            return readIgnoreRoutesFile(resolve(path, ignoreRoutesFile));
        }

        return argv['ignore-routes'] ?? [];
    })();

    const entrypoint = new CommandEntrypoint(
        path,
        discoverParser(path),
        (ignoreRoutes.length === 1) ? ignoreRoutes[0].split(',') : ignoreRoutes,
        spec,
        isDebug
    );

    const response = await command(entrypoint);

    console.log('Routes Discovered', response.routesDiscovered);
    console.log('Spec Endpoints', response.specEndpoints);
    console.log('Coverage Percentage', response.percentage);

    const percentage = Math.round(response.percentage);
    const details = `${response.specEndpoints}/${response.routesDiscovered}`;
    if (percentage === 100) {
        console.log(
            `[info] 🏆 OpenAPI Coverage is at 100% (${details}). Great job! 🌟`,
        );
    } else if (percentage >= 75) {
        console.log(
            `[notice] ℹ️ OpenAPI coverage is at ${percentage}% (${details})`,
        );
    } else if (percentage >= 40) {
        console.log(
            `[warning] ⚠️ OpenAPI Coverage is very low at ${percentage}% (${details})`,
        );
    } else {
        console.log(
            `[error] 🚨 OpenAPI Coverage is extremely low at ${percentage}% (${details})`,
        );
    }

    if ((isDebug) && (response.debugMessages.length > 0)) {
        const debug = console.debug;
        response.debugMessages.forEach((message) => debug(message));
    }

    if (response.errorMessages.length > 0) {
        const error = console.error;
        response.errorMessages.forEach(({message, file, line}) => error(message, {file, startLine: line}));
    }
}
