<?php

declare(strict_types=1);

namespace OpenApiCoverage\RouteFilter;

class RegexRouteFilter implements RouteFilterInterface
{
    /**
     * @var string[]
     */
    private $filter;

    public function __construct(
        array $filter
    )
    {
        $this->filter = \array_map(function (string $regex): string {
            return \str_replace('#', '\\#', $regex);
        }, $filter);
    }

    public function __invoke(string $uri): bool
    {
        $uri = \strtolower($uri);
        foreach ($this->filter as $expression) {
            if (\preg_match("#{$expression}#", $uri) === 1) {
                return false;
            }
        }

        return true;
    }
}
