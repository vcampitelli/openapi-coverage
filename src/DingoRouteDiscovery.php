<?php

declare(strict_types=1);

namespace OpenApiCoverage;

use Dingo\Api\Routing\Router;

class DingoRouteDiscovery
{
    public function __invoke(EndpointCollection $collection, callable $shouldConsider = null): void
    {
        /** @var Router $router */
        $router = \app(Router::class);

        /** @var \Illuminate\Routing\Route $route */
        foreach ($router->getRoutes() as $routes) {
            foreach ($routes as $route) {
                // Ignorando algumas rotas
                if (($shouldConsider !== null) && ($shouldConsider($route) === false)) {
                    continue;
                }
                foreach ($route->methods() as $method) {
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
