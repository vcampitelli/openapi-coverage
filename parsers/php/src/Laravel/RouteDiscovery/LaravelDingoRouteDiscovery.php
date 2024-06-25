<?php

declare(strict_types=1);

namespace OpenApiCoverage\Laravel\RouteDiscovery;

use Dingo\Api\Routing\Router;
use OpenApiCoverage\Output;
use OpenApiCoverage\RouteDiscoveryInterface;
use OpenApiCoverage\RouteFilter\RouteFilterInterface;

class LaravelDingoRouteDiscovery implements RouteDiscoveryInterface
{
    /**
     * @var string|null
     */
    private $basePath;

    public function __construct(string $basePath = null)
    {
        $this->basePath = ($basePath)
            ? \rtrim($basePath, \DIRECTORY_SEPARATOR) . \DIRECTORY_SEPARATOR
            : null;
    }

    public function __invoke(Output $output): int
    {
        $discovered = 0;

        /** @var Router $router */
        $router = \app(Router::class);
        /** @phpstan-ignore function.notFound */

        foreach ($router->getRoutes() as $routes) {
            /** @var \Illuminate\Routing\Route $route */
            foreach ($routes as $route) {
                $controllerFile = $this->getController($route);
//                var_dump($route->uri);
//                if (strpos($route->uri, 'content/redirect') !== false) {
//                    var_dump(get_class($route->controller));
//                    var_dump($controllerFile);
//                    die;
//
//                }
//                if (($controllerFile === '') || ($controllerFile === null)) {
//                    var_dump(get_class($route->controller));
//                    die;
//                }
                foreach ($route->methods() as $method) {
                    $method = \strtoupper($method);
                    if ($method === 'HEAD') {
                        continue;
                    }
                    $output->endpoint($method, $route->uri, $controllerFile);
                    $discovered++;
                }
            }
        }

        return $discovered;
    }

    protected function getController(\Illuminate\Routing\Route $route): ?string
    {
        $controller = $route->controller;
        if (empty($controller)) {
            return null;
        }

        try {
            $reflector = new \ReflectionClass($controller);
        } catch (\ReflectionException $e) {
            return null;
        }

        $file = $reflector->getFileName();
        if (empty($file)) {
            return null;
        }

        $length = \strlen($this->basePath);
        if (\substr($file, 0, $length) === $this->basePath) {
            $file = \substr($file, $length);
        }
        return $file;
    }
}
