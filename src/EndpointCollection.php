<?php

declare(strict_types=1);

namespace OpenApiCoverage;

use ArrayIterator;
use Generator;
use stdClass;
use Traversable;

class EndpointCollection implements \IteratorAggregate
{
    /**
     * @var array<string, stdClass&object{endpoint: Endpoint, matched: bool}>
     */
    private $endpoints = [];

    private $hits = 0;

    public function add(Endpoint $endpoint): self
    {
        $this->hits++;

        $key = $endpoint->getMethod() . '_' . $endpoint->getNormalizedPath();

        if (!isset($this->endpoints[$key])) {
            $object = new stdClass();
            $object->endpoint = $endpoint;
            $object->matched = false;
            $this->endpoints[$key] = $object;
            return $this;
        }

        $this->endpoints[$key]->matched = true;
        return $this;
    }

    /**
     * @return Generator|Endpoint[]
     */
    public function getUnmatchedEndpoints(): Generator
    {
        /**
         * @var Endpoint $endpoint
         * @var bool $count
         */
        foreach ($this->endpoints as [$endpoint, $count]) {
            if ($count === false) {
                yield $endpoint;
            }
        }
    }

    public function getIterator(): ArrayIterator
    {
        return new ArrayIterator($this->endpoints);
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
