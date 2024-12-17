import CommandEntrypoint from './CommandEntrypoint';
import EndpointCollection from '../Endpoint/EndpointCollection';
import {laravelParser} from '../Parser/php';
import openApiReader from '../openApiReader';
import Response from './Response';
import {ParserInterface} from "../Parser";

function getParser(): ParserInterface {
  return laravelParser;
}

export default async function run(entrypoint: CommandEntrypoint): Promise<Response> {
    const response = entrypoint.response;

    const collection = new EndpointCollection();

    // @TODO require a parameter to specify which application we're running or even create some kind of discoverer
    response.debug('Iniciando descoberta de endpoints na API...');
    const parser = getParser();
    const routesDiscovered = await parser(
        collection,
        entrypoint.basePath,
        entrypoint.routeFilter,
    );
    if (routesDiscovered === 0) {
        throw new Error('Nenhum endpoint foi encontrado.');
    }
    const routesDiscoveredFormatted = formatNumber(routesDiscovered);
    response.debug(`Encontrados ${routesDiscoveredFormatted} endpoints na API`);
    response.routesDiscovered = routesDiscovered;

    response.debug('Iniciando descoberta de endpoints na especificação OpenAPI...');
    const openApiEndpoints = await openApiReader(collection, entrypoint.openApiSpecFile);
    const openApiEndpointsFormatted = formatNumber(openApiEndpoints);
    response.debug(`Encontrados ${openApiEndpointsFormatted} endpoints na especificação OpenAPI`);
    response.specEndpoints = openApiEndpoints;

    response.debug(`Listando endpoints não encontrados...`);
    let count = 0;
    for (const endpoint of collection.getUnmatchedEndpoints()) {
        count++;
        response.debug(`${count}\t${endpoint.method}\t${endpoint.path}\t${endpoint.file ?? ''}\t${endpoint.line ?? ''}`);
        response.error(
            `Endpoint ${endpoint.method} ${endpoint.path} missing in OpenAPI Spec`,
            endpoint.file,
            endpoint.line
        );
    }

    const percentage = response.percentage.toFixed();
    response.debug(`Coverage: ${percentage}% (${openApiEndpointsFormatted}/${routesDiscoveredFormatted})`);

    return response;
}

const formatNumber = (value: number): string => value.toLocaleString('en-US', {useGrouping: true});
