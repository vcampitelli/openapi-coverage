import {ParserInterface} from './index';

export enum ParserLanguage {
    Php,
    Node,
}

type ParserType = {
    language: ParserLanguage;
    framework?: string;
    parser: ParserInterface;
};

export default ParserType;
