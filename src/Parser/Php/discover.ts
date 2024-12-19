import ParserType, {ParserLanguage} from '../ParserType';
import {jsonReader, ParserDiscover} from '../discover';
import {laravelParser} from './';

const discoverPhpParser: ParserDiscover = (path: string): ParserType | false => {
    const json = jsonReader(path, 'composer.json');
    if ((json === false) || (!('require' in json))) {
        return false;
    }

    if ('laravel/framework' in json.require) {
        return {
            language: ParserLanguage.Php,
            framework: 'laravel',
            parser: laravelParser,
        };
    }

    return false;
};
export default discoverPhpParser;
