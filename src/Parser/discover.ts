import ParserType from './ParserType';
import discoverNodeParser from './Node/discover';
import discoverPhpParser from './Php/discover';
import {readFileSync} from 'fs';
import {join} from 'node:path';

export default function discoverParser(path: string): ParserType {
    const chain: ParserDiscover[] = [
        discoverNodeParser,
        discoverPhpParser,
    ];

    for (const discoverer of chain) {
        const parserType = discoverer(path);
        if (parserType !== false) {
            return parserType;
        }
    }

    throw new Error('Cannot autodetect project language and/or tools. Please specify.');
}

export function jsonReader<T = any> (
    path: string,
    filename: string,
): T | false {
    try {
        const file = readFileSync(join(path, filename), {
            encoding: 'utf-8',
            flag: 'r',
        });

        return JSON.parse(file) as T;
    } catch (err: unknown) {
        // Logging errors that are not "File not found"
        if ((!(err instanceof Error)) || (!('code' in err)) || (err.code !== 'ENOENT')) {
            console.error(err);
        }
        return false;
    }
}

export type ParserDiscover = (path: string) => ParserType | false;
