<?php

declare(strict_types=1);

namespace OpenApiCoverage\Command;

use OpenApiCoverage\EndpointCollection;
use OpenApiCoverage\Laravel\LaravelBootstrap;
use OpenApiCoverage\OpenApiReader;
use RuntimeException;

use function number_format;
use function round;

class Command
{
    /**
     * @var CommandEntrypoint
     */
    private $entrypoint;

    public function __construct(CommandEntrypoint $entrypoint)
    {
        $this->entrypoint = $entrypoint;
    }

    /**
     * @throws \OpenApi\OpenApiException
     */
    public function run(): Output
    {
        $entrypoint = $this->entrypoint;

        $response = $entrypoint->getResponse();

        // @TODO require a parameter to specify which application we're running or even create some kind of discoverer
        $bootstrap = new LaravelBootstrap();
        $discovery = $bootstrap($entrypoint->getBasePath());

        $collection = new EndpointCollection();

        $response->debug("Iniciando descoberta de endpoints na API...");
        // @TODO marcar arquivos e linhas das rotas
        $routesDiscovered = $discovery($collection, $entrypoint->getRouteFilter());
        if ($routesDiscovered === 0) {
            throw new RuntimeException('Nenhum endpoint foi encontrado.');
        }
        $routesDiscoveredFormatted = number_format($routesDiscovered, 0, '', '.');
        $response->debug("Encontrados {$routesDiscoveredFormatted} endpoints na API");
        $response->setRoutesDiscovered($routesDiscovered);

        $response->debug("Iniciando descoberta de endpoints na especificação OpenAPI...");
        $reader = new OpenApiReader();
        $openApiEndpoints = $reader($collection, $entrypoint->getOpenApiSpecFile());
        $openApiEndpointsFormatted = number_format($openApiEndpoints, 0, '', '.');
        $response->debug("Encontrados {$openApiEndpointsFormatted} endpoints na especificação OpenAPI");
        $response->setSpecEndpoints($openApiEndpoints);

        $count = 0;
        foreach ($collection->getUnmatchedEndpoints() as $endpoint) {
            ++$count;
            $response->debug("{$count}\t{$endpoint->getMethod()}\t{$endpoint->getPath()}");
        }

        $percentage = round($response->getPercentage(), 2);
        $response->debug("Coverage: {$percentage}% ({$openApiEndpointsFormatted}/{$routesDiscoveredFormatted})");
        return $response;
    }
}
