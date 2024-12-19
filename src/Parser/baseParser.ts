import {join, resolve, sep} from 'node:path';

export function getParserDir(folder: string) {
    const paths = __dirname.split(sep);

    let cwd = resolve(__dirname, '..', '..');
    if (paths.pop() !== 'dist') {
        cwd = resolve(cwd, '..');
    }
    return join(cwd, 'parsers', folder);
}
