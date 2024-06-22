<?php

declare(strict_types=1);

namespace OpenApiCoverage\Command;

use OpenApiCoverage\EndpointCollection;
use OpenApiCoverage\Laravel\LaravelBootstrap;
use OpenApiCoverage\OpenApiReader;

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
        $discovery($collection, $entrypoint->getRouteFilter());
        $routesDiscovered = $collection->hits();
        $response->debug("  Encontrados {$routesDiscovered} endpoints");
        $response->setRoutesDiscovered($routesDiscovered);

        $collection->resetHits();

        $response->debug("Iniciando descoberta de endpoints na especificação OpenAPI...");
        $reader = new OpenApiReader();
        $reader($collection, $entrypoint->getOpenApiSpecFile());
        $openApiEndpoints = $collection->hits();
        $response->debug("  Encontrados {$openApiEndpoints} endpoints");
        $response->setSpecEndpoints($openApiEndpoints);

        $count = 0;
        foreach ($collection->getUnmatchedEndpoints() as $endpoint) {
            ++$count;
            $response->debug("{$count}\t{$endpoint->getMethod()}\t{$endpoint->getPath()}");
        }

        $percentage = round($response->getPercentage(), 2);
        $response->debug("Coverage: {$percentage}% ({$openApiEndpoints}/{$routesDiscovered})");
        return $response;
    }
}
