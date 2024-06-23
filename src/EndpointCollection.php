<?php

declare(strict_types=1);

namespace OpenApiCoverage;

use ArrayIterator;
use Generator;
use stdClass;
use Traversable;

/**
 * @phpstan-type EndpointMatching stdClass&object{endpoint: Endpoint, matched: bool}
 */
class EndpointCollection implements \IteratorAggregate
{
    /**
     * @var array<string, EndpointMatching>
     */
    private $endpoints = [];

    public function add(Endpoint $endpoint): self
    {
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
         * @var EndpointMatching $object
         */
        foreach ($this->endpoints as $object) {
            if ($object->matched === false) {
                yield $object->endpoint;
            }
        }
    }

    public function getIterator(): ArrayIterator
    {
        return new ArrayIterator($this->endpoints);
    }
}
