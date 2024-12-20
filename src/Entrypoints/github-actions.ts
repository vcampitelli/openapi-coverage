import {
    debug,
    error,
    getBooleanInput,
    getInput,
    getMultilineInput,
    info,
    notice,
    setFailed,
    setOutput,
    summary,
    warning,
} from '@actions/core';
import CommandEntrypoint from '../Command/CommandEntrypoint';
import command from '../Command';
import {resolve} from 'node:path';
import readIgnoreRoutesFile from '../Utils/readIgnoreRoutesFile';
import {languagefromString} from '../Parser/Language';

export default async function () {
    try {
        const languageInput = getInput('language');
        const language = languagefromString(languageInput);
        if (language === null) {
            throw new Error(`Invalid language: ${languageInput}`);
        }

        const path = getInput('path') ?? process.cwd();
        const spec = getInput('spec');
        const isDebug = getBooleanInput('debug');
        const ignoreRoutes = (function (): string[] {
            const ignoreRoutesFile = getInput('ignore-routes-file');
            if (ignoreRoutesFile) {
                return readIgnoreRoutesFile(resolve(path, ignoreRoutesFile));
            }

            return getMultilineInput('ignore-routes');
        })();

        const entrypoint = new CommandEntrypoint(
            path,
            language,
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

        summary.addRaw('| Item | Valor |', true);
        summary.addRaw('|-|-:|', true);
        summary.addRaw(`| 📋 <b>Rotas na OpenAPI</b> | ${response.specEndpoints} |`, true);
        summary.addRaw(`| 🛣️ <b>Rotas na Aplicação</b> | ${response.routesDiscovered} |`, true);
        summary.addRaw(`| 🔢 <b>Coverage</b> | ${percentage}% |`, true);
        await summary.write();
    } catch (error: unknown) {
        setFailed((error as Error).message);
    }
};
