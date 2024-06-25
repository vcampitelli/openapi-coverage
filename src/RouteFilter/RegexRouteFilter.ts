import RouteFilterInterface from './RouteFilterInterface';

class RegexRouteFilter implements RouteFilterInterface {
    private readonly regex: RegExp[];

    constructor(filter: string[]) {
        this.regex = filter.map((expression: string) => {
            return new RegExp(expression);
        });
    }

    public filter(method: string, uri: string): boolean {
        uri = uri.toLowerCase();
        for (const regexp of this.regex) {
            if (regexp.test(uri)) {
                return false;
            }
        }

        return true;
    }
}

export default RegexRouteFilter;
