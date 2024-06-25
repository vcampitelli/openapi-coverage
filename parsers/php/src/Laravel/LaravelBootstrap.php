<?php

declare(strict_types=1);

namespace OpenApiCoverage\Laravel;

use Illuminate\Contracts\Console\Kernel;
use InvalidArgumentException;
use OpenApiCoverage\BootstrapInterface;
use OpenApiCoverage\Laravel\RouteDiscovery\LaravelDingoRouteDiscovery;
use OpenApiCoverage\Output;
use OpenApiCoverage\RouteDiscoveryInterface;

class LaravelBootstrap implements BootstrapInterface
{
    public function __invoke(Output $output, string $basePath): RouteDiscoveryInterface
    {
        $basePath = \realpath($basePath);
        if (($basePath === false) || (!\is_dir($basePath))) {
            throw new InvalidArgumentException('Caminho base da aplicação é inválido');
        }

        require "{$basePath}/vendor/autoload.php";
        $app = require_once "{$basePath}/bootstrap/app.php";
        $kernel = $app->make(Kernel::class);
        $kernel->bootstrap();

        require "{$basePath}/routes/api.php"; // @FIXME

        return new LaravelDingoRouteDiscovery($basePath);
    }
}
