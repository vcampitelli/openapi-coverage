<?php

declare(strict_types=1);

namespace OpenApiCoverage\Laravel\RouteDiscovery;

use Dingo\Api\Routing\Router;
use OpenApiCoverage\Endpoint;
use OpenApiCoverage\EndpointCollection;
use OpenApiCoverage\RouteDiscoveryInterface;
use OpenApiCoverage\RouteFilter\RouteFilterInterface;

class LaravelDingoRouteDiscovery implements RouteDiscoveryInterface
{
    public function __invoke(EndpointCollection $collection, RouteFilterInterface $filter = null): void
    {
        /** @var Router $router */
        $router = \app(Router::class);

        foreach ($router->getRoutes() as $routes) {
            /** @var \Illuminate\Routing\Route $route */
            foreach ($routes as $route) {
                // Ignorando algumas rotas
                if (($filter !== null) && ($filter($route->uri) === false)) {
                    continue;
                }
                foreach ($route->methods() as $method) {
                    $method = \strtoupper($method);
                    if ($method === 'HEAD') {
                        continue;
                    }
                    $collection->add(
                        new Endpoint(
                            $method,
                            $route->uri
                        )
                    );
                }
            }
        }
    }
}
