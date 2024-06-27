import {
    debug,
    warning,
    error,
    info,
    notice,
    getInput,
    setOutput,
    setFailed,
    getBooleanInput, getMultilineInput,
} from '@actions/core';
import CommandEntrypoint from './Command/CommandEntrypoint';
import command from './Command';
import {existsSync, readFileSync} from 'node:fs';
import {resolve} from 'node:path';

try {
    (async function () {
        const path = getInput('path') ?? process.cwd();
        const spec = getInput('spec');
        const isDebug = getBooleanInput('debug');
        const ignoreRoutes = (function (): string[] {
            let ignoreRoutesFile = getInput('ignore-routes-file');
            if (ignoreRoutesFile) {
                ignoreRoutesFile = resolve(path, ignoreRoutesFile);
                if (existsSync(ignoreRoutesFile)) {
                    return readFileSync(
                        ignoreRoutesFile,
                        {encoding: 'utf8'}
                    ).trimEnd().split("\n");
                }
            }

            return getMultilineInput('ignore-routes');
        })();

        const entrypoint = new CommandEntrypoint(
            path,
            (ignoreRoutes.length === 1) ? ignoreRoutes[0].split(',') : ignoreRoutes,
            spec,
            isDebug
        );

        const response = await command(entrypoint);

        setOutput('routes_discovered', response.routesDiscovered);
        setOutput('spec_endpoints', response.specEndpoints);
        setOutput('coverage_percentage', response.percentage);

        const percentage = Math.round(response.percentage);
        const details = `${response.specEndpoints}/${response.routesDiscovered}`;
        if (percentage === 100) {
            info(
                `🏆 OpenAPI Coverage is at 100% (${details}). Great job! 🌟`,
            );
        } else if (percentage >= 75) {
            notice(
                `ℹ️ OpenAPI coverage is at ${percentage}% (${details})`,
            );
        } else if (percentage >= 40) {
            warning(
                `⚠️ OpenAPI Coverage is very low at ${percentage}% (${details})`,
            );
        } else {
            error(
                `🚨 OpenAPI Coverage is extremely low at ${percentage}% (${details})`,
            );
        }

        if ((isDebug) && (response.debugMessages.length > 0)) {
            response.debugMessages.forEach((message) => debug(message));
        }

        if (response.errorMessages.length > 0) {
            response.errorMessages.forEach(({message, file, line}) => error(message, {file, startLine: line}));
        }
    })();
} catch (error: unknown) {
    setFailed((error as Error).message);
}
