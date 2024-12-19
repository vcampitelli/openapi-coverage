import cliEntrypoint from './Entrypoints/cli';
import githubActionsEntrypoint from './Entrypoints/github-actions';

(async function () {
    // Detecting GitHub Actions environment
    if (('INPUT_PATH' in process.env) ||
        ('IGNORE-ROUTES' in process.env) ||
        ('IGNORE-ROUTES-FILE' in process.env) ||
        ('SPEC' in process.env) ||
        ('DEBUG' in process.env)) {
        await githubActionsEntrypoint();
        return;
    }

    await cliEntrypoint();
})();
