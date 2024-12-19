import { existsSync } from 'node:fs';
import { extname, join, resolve, sep } from 'node:path';
import Response from './Response';
import RouteFilterInterface from '../RouteFilter/RouteFilterInterface';
import RegexRouteFilter from '../RouteFilter/RegexRouteFilter';
import type ParserType from '../Parser/ParserType';

class CommandEntrypoint {
    private readonly _basePath: string;
    private readonly _routeFilter: RouteFilterInterface | null = null;
    private readonly _openApiSpecFile: string;
    private readonly _parserType: ParserType;
    private readonly _response: Response;

    constructor(
        basePath: string,
        parserType: ParserType,
        ignoreRoutes?: string[],
        pathToSpec?: string,
        debug: boolean = false,
    ) {
        this._response = new Response(debug);

        // App type
        this._parserType = parserType;

        // Base application path
        this._basePath = this.parseBasePath(basePath);

        // OpenAPI specification file
        this._openApiSpecFile = this.parseOpenApiSpec(this._basePath, pathToSpec);

        // Route filter
        if (ignoreRoutes) {
            this._routeFilter = this.generateRouteFilter(ignoreRoutes);
        }
    }

    private parseBasePath(basePath: string): string {
        const realPath = resolve(basePath).replace(/[\\/]+$/, '') + sep;
        if (!existsSync(realPath)) {
            throw new Error(`O caminho da aplicação não é um diretório válido: ${basePath}`);
        }
        return realPath;
    }

    private parseOpenApiSpec(basePath: string, pathToSpec?: string): string {
        if (pathToSpec) {
            const realPath = resolve(pathToSpec);
            if (!existsSync(realPath)) {
                throw new Error(`OpenAPI spec file does not exist: ${pathToSpec}`);
            }
            const extension = extname(realPath).toLowerCase();
            if (extension !== '.yaml' && extension !== '.yml') {
                throw new Error(`OpenAPI spec file should be YAML (${realPath})`);
            }
            return realPath;
        }

        // Tentando encontrar o caminho da especificação
        const paths = [
            'openapi.yaml',
            'openapi.yml',
            'docs/openapi.yaml',
            'docs/openapi.yml',
        ];
        for (const path of paths) {
            const fullPath = join(basePath, path);
            if (existsSync(fullPath)) {
                return fullPath;
            }
        }
        throw new Error('Não foi possível encontrar o arquivo da especificação OpenAPI');
    }

    private generateRouteFilter(filter: string[] | null): RouteFilterInterface | null {
        if (filter === null || filter.length === 0) {
            return null;
        }

        return new RegexRouteFilter(filter);
    }

    get basePath(): string {
        return this._basePath;
    }

    get routeFilter(): RouteFilterInterface | null {
        return this._routeFilter;
    }

    get openApiSpecFile(): string {
        return this._openApiSpecFile;
    }

    get response(): Response {
        return this._response;
    }

    get parserType(): ParserType {
        return this._parserType;
    }
}


export default CommandEntrypoint;
