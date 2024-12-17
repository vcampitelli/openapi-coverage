<?php

declare(strict_types=1);

namespace OpenApiCoverage;

class Output
{
    private const TYPE_ENDPOINT = 'endpoint';

    private array $found = [];

    public function endpoint(string $method, string $uri, string $file = null, int $line = null): self
    {
        $key = \strtolower("{$method}_{$uri}");
        if (!isset($this->found[$key])) {
            $this->found[$key] = true;
            echo self::TYPE_ENDPOINT . "\t{$method}\t{$uri}\t{$file}" . (($line === null) ? null : "\t{$line}") . "\n";
        }
        return $this;
    }
}
