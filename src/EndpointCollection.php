<?php

declare(strict_types=1);

namespace OpenApiCoverage;

use Traversable;

class EndpointCollection implements \IteratorAggregate
{
    /**
     * @var Endpoint[]
     */
    private $endpoints = [];

    private $hits = 0;

    public function add(Endpoint $endpoint): self
    {
        $key = $endpoint->getMethod() . '_' . $endpoint->getNormalizedPath();
        $this->hits++;
        if (isset($this->endpoints[$key])) {
            $this->endpoints[$key][1] = true;
        } else {
            $this->endpoints[$key] = [$endpoint, false];
        }
        return $this;
    }

    public function has(Endpoint $endpoint): bool
    {
        $key = $endpoint->getNormalizedPath();
        return isset($this->endpoints[$key]);
    }

    /**
     * @return \Generator|Endpoint[]
     */
    public function getUnmatchedEndpoints(): \Generator
    {
        foreach ($this->endpoints as [$endpoint, $count]) {
            if ($count === false) {
                yield $endpoint;
            }
        }
    }

    public function getIterator(): \ArrayIterator
    {
        return new \ArrayIterator($this->endpoints);
    }

    public function hits(): int
    {
        return $this->hits;
    }

    public function resetHits(): void
    {
        $this->hits = 0;
    }
}
