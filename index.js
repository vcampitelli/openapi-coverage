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
const { exec } = require('@actions/exec');

/**
 * @param {String} path
 * @param {String} filter
 * @param {String} spec
 * @param {Boolean} debugEnabled
 * @returns {Promise<{routes_discovered: number, endpoints_in_spec: number, coverage_percentage: number, debug: string}>}
 */
const runCoverage = async (path, filter, spec, debugEnabled = false) => {
    const args = [];
    if (filter) {
        args.push('--filter');
        args.push(filter);
    }
    if (spec) {
        args.push('--spec');
        args.push(spec);
    }
    if (debugEnabled) {
        args.push('--debug');
    }
    if (path === '.') {
        path = process.cwd();
    }
    args.push(path);
    debug(`Executing with args: ${JSON.stringify(args)}`);

    let stdout = '';
    let stderr = '';
    const options = {
        silent: true,
        cwd: __dirname,
        listeners: {
            stdout: (data) => {
                stdout += data.toString();
            },
            stderr: (data) => {
                stderr += data.toString();
            },
        },
    };

    const exitCode = await exec(
        '"./openapi-coverage"',
        args,
        options,
    );
    if (exitCode > 0) {
        throw new Error(`Error ${exitCode}: ${stderr}`);
    }

    return JSON.parse(stdout);
};

try {
    (async function () {
        const path = getInput('path', { required: true });
        const filter = getInput('filter');
        const spec = getInput('spec');
        const debug = getBooleanInput('debug');

        const response = await runCoverage(path, filter, spec, debug);

        setOutput('routes_discovered', response.routes_discovered);
        setOutput('endpoints_in_spec', response.endpoints_in_spec);
        setOutput('coverage_percentage', response.coverage_percentage);

        const percentage = Math.round(response.coverage_percentage);
        const details = `${response.endpoints_in_spec}/${response.routes_discovered}`;
        if (percentage === 100) {
            info(
                `🏆 OpenAPI Coverage is at 100% (${details}). Great job! 🌟`
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
