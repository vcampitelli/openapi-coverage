#!/usr/bin/env php
<?php

declare(strict_types=1);

use OpenApiCoverage\BootstrapInterface;
use OpenApiCoverage\Laravel\LaravelBootstrap;
use OpenApiCoverage\Output;

try {
    $options = \getopt('', [
        'app:',
        'path:',
        'debug',
    ], $restIndex);

    // Application path
    $basePath = $options['path'] ?? getcwd();

    require __DIR__ . '/vendor/autoload.php';

    $getApp = function (string $app): BootstrapInterface {
        switch ($app) {
            case 'laravel':
                return new LaravelBootstrap();

            default:
                throw new \InvalidArgumentException("Unknown application {$options['app']}");
        }
    };

    $output = new Output();
    $bootstrap = $getApp($options['app'] ?? 'laravel');
    $discovery = $bootstrap($output, $basePath);

//    $collection = new EndpointCollection();
//
//    $response->debug("Iniciando descoberta de endpoints na API...");
    // @TODO marcar arquivos e linhas das rotas
    $routesDiscovered = $discovery($output);
    if ($routesDiscovered === 0) {
        throw new RuntimeException('Nenhum endpoint foi encontrado.');
    }

} catch (InvalidArgumentException $e) {
    fwrite(
        STDERR,
        "Error: {$e->getMessage()}" . PHP_EOL .
        "Usage: {$argv[0]} [options]" . PHP_EOL .
        PHP_EOL .
        'Options:' . PHP_EOL .
        '  --path            Base application path' . PHP_EOL .
        '  --app <type>      Application type (default: Laravel)' . PHP_EOL .
        '  --debug           Prints debugging information' . PHP_EOL
    );
    $code = $e->getCode();
    die(($code > 0) ? $code : 1);
} catch (Throwable $e) {
    fwrite(
        STDERR,
        "Error: {$e->getMessage()}"
    );
    $code = $e->getCode();
    die(($code > 0) ? $code : 1);
}
