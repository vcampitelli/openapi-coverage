import ParserType, {ParserLanguage} from '../ParserType';
import expressParser from './';
import {jsonReader, ParserDiscover} from '../discover';

const discoverNodeParser: ParserDiscover = (path: string): ParserType | false => {
    const json = jsonReader(path, 'package.json');
    if ((json === false) || (!('dependencies' in json))) {
        return false;
    }

    if ('express' in json.dependencies) {
        return {
            language: ParserLanguage.Node,
            framework: 'express',
            parser: expressParser,
        };
    }

    return false;
};
export default discoverNodeParser;
