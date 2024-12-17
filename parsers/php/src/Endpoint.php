<?php

declare(strict_types=1);

namespace OpenApiCoverage;

use InvalidArgumentException;
use phpDocumentor\Reflection\Types\Boolean;

class Endpoint
{
    /**
     * @var string
     */
    private $method;

    /**
     * @var string
     */
    private $path;

    /**
     * @var string
     */
    private $normalizedPath;

    public function __construct(string $method, string $path)
    {
        $method = \strtoupper($method);
        if (!\in_array($method, ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'])) {
            throw new InvalidArgumentException("Método {$method} inválido para o endpoint {$path}");
        }

        $this->method = $method;
        $this->path = $path;
        $this->normalizedPath = \strtolower(
            \trim(
                (\strpos($path, '{') === false)
                    ? $path
                    : \preg_replace('/\{[^{]+}/', '{param}', $path),
                "/ "
            )
        );
    }

    public function getMethod(): string
    {
        return $this->method;
    }

    public function getPath(): string
    {
        return $this->path;
    }

    public function getNormalizedPath(): string
    {
        return $this->normalizedPath;
    }

    public function equals(Endpoint $endpoint): bool
    {
        return (($endpoint->getMethod() === $this->method) &&
            ($endpoint->getNormalizedPath() === $this->normalizedPath));
    }
}
