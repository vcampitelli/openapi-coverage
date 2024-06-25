<?php

declare(strict_types=1);

namespace OpenApiCoverage;

class Output
{
    private const TYPE_ENDPOINT = 'endpoint';

    public function endpoint(string $method, string $uri, string $file = null, string $line = null): self
    {
        echo self::TYPE_ENDPOINT . "\t{$method}\t{$uri}\t{$file}" . (($line === null) ? null : "\t{$line}") . "\n";
        return $this;
    }
}
