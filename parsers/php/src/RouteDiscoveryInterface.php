<?php

declare(strict_types=1);

namespace OpenApiCoverage;

interface RouteDiscoveryInterface
{
    public function __invoke(Output $output): int;
}
