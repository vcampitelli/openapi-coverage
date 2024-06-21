<?php

declare(strict_types=1);

namespace OpenApiCoverage;

use Illuminate\Contracts\Console\Kernel;

class LaravelBootstrap
{
    public function __invoke(string $basePath): void
    {
        $basePath = \realpath($basePath);
        if (($basePath === false) || (!\is_dir($basePath))) {
            throw new \InvalidArgumentException('Caminho base da aplicação é inválido');
        }

        require "{$basePath}/vendor/autoload.php";
        $app = require_once "{$basePath}/bootstrap/app.php";
        $kernel = $app->make(Kernel::class);
        $kernel->bootstrap();

        require "{$basePath}/routes/api.php"; // @FIXME
    }
}
