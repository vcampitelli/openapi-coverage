<?php

declare(strict_types=1);

namespace OpenApiCoverage;

interface BootstrapInterface
{
    public function __invoke(Output $output, string $basePath): RouteDiscoveryInterface;
}
