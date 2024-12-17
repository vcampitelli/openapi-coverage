<?php

declare(strict_types=1);

namespace OpenApiCoverage\Laravel\RouteDiscovery;

use Dingo\Api\Routing\Router;
use Illuminate\Routing\Route;
use Illuminate\Support\Str;
use OpenApiCoverage\Output;
use OpenApiCoverage\RouteDiscoveryInterface;
use OpenApiCoverage\RouteFilter\RouteFilterInterface;
use ReflectionClass;

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
        /** @phpstan-ignore function.notFound */
        $router = \app(Router::class);

        foreach ($router->getRoutes() as $routes) {
            /** @var Route $route */
            foreach ($routes as $route) {
                [$controllerFile, $line] = $this->getController($route);
                foreach ($route->methods() as $method) {
                    $method = \strtoupper($method);
                    if ($method === 'HEAD') {
                        continue;
                    }
                    $output->endpoint($method, $route->uri, $controllerFile, $line);
                    $discovered++;
                }
            }
        }

        return $discovered;
    }

    /**
     * @param Route $route
     * @return array|null
     * @SuppressWarnings(PHPMD.StaticAccess)
     */
    protected function getController(Route $route): ?array
    {
        $controller = $route->controller;
        if (empty($controller)) {
            return null;
        }

        try {
            $reflector = new ReflectionClass($controller);
        } catch (\ReflectionException $e) {
            return null;
        }

        $file = $reflector->getFileName();
        if (empty($file)) {
            return null;
        }

        $line = null;
        if (!empty($route->action['uses'])) {
            $callback = Str::parseCallback($route->action['uses']);
            if (!empty($callback[1])) {
                try {
                    $method = $reflector->getMethod($callback[1]);
                    $startLine = $method->getStartLine();
                    if ($startLine !== false) {
                        $line = $startLine;
                    }
                } catch (\ReflectionException $e) {
                    // Ignoring errors
                }
            }
        }

        $length = \strlen($this->basePath);
        if (\substr($file, 0, $length) === $this->basePath) {
            $file = \substr($file, $length);
        }
        return [$file, $line];
    }
}
