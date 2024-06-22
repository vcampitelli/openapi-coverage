<?php

declare(strict_types=1);

namespace OpenApiCoverage\RouteFilter;

interface RouteFilterInterface
{
    public function __invoke(string $uri): bool;
}
