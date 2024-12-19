import {existsSync, readFileSync} from 'node:fs';

export default function readIgnoreRoutesFile(file: string): string[] {
    if (!existsSync(file)) {
        return [];
    }

    return readFileSync(
        file,
        {encoding: 'utf8'}
    ).trimEnd().split("\n");
}
