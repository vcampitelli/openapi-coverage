import nodeParser from './Node';
import phpParser from './Php';
import {ParserInterface} from './';

enum ParserLanguage {
    Php,
    Node,
}

export function languagefromString(language: string): ParserLanguage|null {
    switch (String(language).toLowerCase()) {
        case 'php':
            return ParserLanguage.Php;

        case 'node':
        case 'nodejs':
        case 'javascript':
        case 'js':
            return ParserLanguage.Node;

        default:
            return null;
    }
}

export function getParserForLanguage(language: ParserLanguage): ParserInterface | null {
    switch (language) {
        case ParserLanguage.Php:
            return phpParser;
        case ParserLanguage.Node:
            return nodeParser;
        default:
            return null;
    }
}

export default ParserLanguage;
