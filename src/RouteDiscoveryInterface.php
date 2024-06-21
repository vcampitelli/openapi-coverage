<?php

declare(strict_types=1);

namespace OpenApiCoverage;

use OpenApiCoverage\RouteFilter\RouteFilterInterface;

interface RouteDiscoveryInterface
{
    /**
     * @param EndpointCollection $collection
     * @param RouteFilterInterface|null $filter
     * @return void
     */
    public function __invoke(EndpointCollection $collection, RouteFilterInterface $filter = null): void;
}
