<?php

declare(strict_types=1);

namespace OpenApiCoverage;

use OpenApi\Annotations\OpenApi;
use OpenApi\Annotations\PathItem;
use OpenApi\Serializer;

class OpenApiReader
{
    /**
     * @param EndpointCollection $collection
     * @param string $filename
     * @param string $prefix
     * @return int Discovered endpoints
     * @throws \OpenApi\OpenApiException
     */
    public function __invoke(
        EndpointCollection $collection,
        string $filename,
        string $prefix = ''
    ): int {
        $serializer = new Serializer();
        $discovered = 0;

        /** @var OpenApi $openapi */
        $openapi = $serializer->deserializeFile(
            $filename,
            'yaml'
        );

        $methods = ['get', 'post', 'put', 'patch', 'delete'];

        /**
         * @var string $path
         * @var PathItem $item
         */
        foreach ($openapi->paths as $path => $item) {
            foreach ($methods as $method) {
                if (isset($item->$method)) {
                    $discovered++;
                    $collection->add(
                        new Endpoint(
                            $method,
                            $prefix . $path
                        )
                    );
                }
            }
        }

        return $discovered;
    }
}
