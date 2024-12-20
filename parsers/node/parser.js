#!/bin/env node
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import expressParser from './src/parsers/express.js';

if (!process.argv[2]) {
    console.error(`Usage: node ${process.argv[1]} <path>`);
    process.exit(1);
}

const path = resolve(process.argv[2]);
const json = JSON.parse(
    readFileSync(`${path}/package.json`, {encoding: 'utf-8'})
);
if (!json.dependencies) {
    throw new Error('Bad package.json: no dependencies found.');
}

function getParser(json) {
    if ('express' in json.dependencies) {
        return expressParser;
    }
    return null;
}
const parser = getParser(json);
if (!parser) {
    throw new Error('Bad package.json: no framework detected.');
}

parser(path);
