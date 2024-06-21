const github = require('@actions/github');
const {
    debug,
    warning,
    error,
    info,
    notice,
    getInput,
    setOutput,
    setFailed,
    getBooleanInput,
} = require('@actions/core');
const { getExecOutput } = require('@actions/exec');

/**
 * @param {String} path
 * @param {String} spec
 * @param {Boolean} isDebug
 * @param {String} filterRoutes Comma-separated regular expressions to filter routes
 * @returns {Promise<{routes_discovered: number, spec_endpoints: number, coverage_percentage: number, debug: string}>}
 */
const runCoverage = async (
    path,
    spec = null,
    isDebug = false,
    filterRoutes = null,
) => {
    const args = [];
    if (filterRoutes) {
        args.push('--filter-routes');
        args.push(filterRoutes);
    }
    if (spec) {
        args.push('--spec');
        args.push(spec);
    }
    if (isDebug) {
        args.push('--debug');
    }
    if (path === '.') {
        path = process.cwd();
    }
    args.push(path);
    debug(`Executing with args: ${JSON.stringify(args)}`);

    const output = await getExecOutput(
        '"./openapi-coverage"',
        args,
        {
            silent: true,
            cwd: __dirname,
            ignoreReturnCode: true,
        },
    );
    if (output.exitCode > 0) {
        throw new Error(`Error ${output.exitCode}: ${output.stdout}  / ${output.stderr}`);
    }

    return JSON.parse(output.stdout);
};

try {
    (async function () {
        const path = getInput('path', { required: true });
        const spec = getInput('spec');
        const isDebug = getBooleanInput('debug');
        const filterRoutes = getInput('filter-routes').replaceAll('\n', ',');

        const response = await runCoverage(
            path,
            spec,
            isDebug,
            filterRoutes,
        );

        setOutput('routes_discovered', response.routes_discovered);
        setOutput('spec_endpoints', response.spec_endpoints);
        setOutput('coverage_percentage', response.coverage_percentage);

        const percentage = Math.round(response.coverage_percentage);
        const details = `${response.spec_endpoints}/${response.routes_discovered}`;
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
    })();
} catch (error) {
    setFailed(error.message);
}
