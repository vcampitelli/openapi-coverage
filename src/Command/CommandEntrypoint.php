<?php

declare(strict_types=1);

namespace OpenApiCoverage\Command;

use InvalidArgumentException;
use OpenApiCoverage\RouteFilter\RegexRouteFilter;
use OpenApiCoverage\RouteFilter\RouteFilterInterface;

use function is_dir;
use function is_file;
use function pathinfo;
use function realpath;
use function rtrim;
use function strtolower;

class CommandEntrypoint
{
    /**
     * @var string
     */
    private $basePath;

    /**
     * @var RouteFilterInterface|null
     */
    private $routeFilter;

    /**
     * @var string
     */
    private $openApiSpecFile;

    /**
     * @var Output
     */
    private $response;

    /**
     * @param string $basePath
     * @param bool $debug
     * @param string[]|null $filterRoutes
     * @param string|null $pathToSpec
     */
    public function __construct(
        string $basePath,
        bool $debug,
        array $filterRoutes = null,
        string $pathToSpec = null,
    ) {
        $this->response = new Output($debug);

        // Base application path
        $basePath = realpath($basePath);
        if ($basePath === false) {
            throw new InvalidArgumentException('O caminho da aplicação não é um diretório válido', 1);
        }
        $basePath = rtrim($basePath, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
        if (!is_dir($basePath)) {
            throw new InvalidArgumentException('O caminho da aplicação não é um diretório', 1);
        }
        $this->basePath = $basePath;

        // OpenAPI specification file
        $this->openApiSpecFile = $this->parseOpenApiSpec(
            $basePath,
            $pathToSpec
        );

        // Route filter
        $this->routeFilter = $this->generateRouteFilter(
            $filterRoutes
        );
    }

    private function parseOpenApiSpec(string $basePath, string $path = null): string
    {
        if (!empty($path)) {
            $path = realpath($path);
            if (!is_file($path)) {
                throw new InvalidArgumentException("O arquivo de especificação OpenAPI não existe", 3);
            }
            $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));
            if (($extension !== 'yaml') && ($extension !== 'yml')) {
                throw new InvalidArgumentException("O arquivo de especificação OpenAPI deve ser um YAML", 3);
            }
            return $path;
        }

        // Tentando encontrar o caminho da especificação
        $paths = [
            'openapi.yaml',
            'openapi.yml',
            'docs' . DIRECTORY_SEPARATOR . 'openapi.yaml',
            'docs' . DIRECTORY_SEPARATOR . 'openapi.yml',
        ];
        foreach ($paths as $path) {
            $fullPath = $basePath . $path;
            if (is_file($fullPath)) {
                return $fullPath;
            }
        }
        throw new InvalidArgumentException('Não foi possível encontrar o arquivo da especificação OpenAPI', 4);
    }

    /**
     * @param string[]|null $filter
     * @return RouteFilterInterface|null
     */
    private function generateRouteFilter(
        array $filter = null
    ): ?RouteFilterInterface {
        if (empty($filter)) {
            return null;
        }

        return new RegexRouteFilter(
            $filter
        );
    }

    public function getBasePath(): string
    {
        return $this->basePath;
    }

    public function getRouteFilter(): ?RouteFilterInterface
    {
        return $this->routeFilter;
    }

    /**
     * @return string
     */
    public function getOpenApiSpecFile(): string
    {
        return $this->openApiSpecFile;
    }

    public function getResponse(): Output
    {
        return $this->response;
    }
}
