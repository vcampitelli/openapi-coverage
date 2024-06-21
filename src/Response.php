<?php

declare(strict_types=1);

namespace OpenApiCoverage;

class Response implements \JsonSerializable
{
    private $routesDiscovered = 0;
    private $specEndpoints = 0;
    private $debugMessages = [];
    private $isDebug;

    public function __construct(bool $isDebug = false)
    {
        $this->isDebug = $isDebug;
    }

    public function setRoutesDiscovered(int $routesDiscovered): self
    {
        $this->routesDiscovered = $routesDiscovered;
        return $this;
    }

    public function setSpecEndpoints(int $specEndpoints): self
    {
        $this->specEndpoints = $specEndpoints;
        return $this;
    }

    public function getPercentage(): float
    {
        return \round($this->specEndpoints / $this->routesDiscovered * 100, 2);
    }

    public function debug(string $message): self
    {
        if ($this->isDebug) {
            $this->debugMessages[] = $message;
        }
        return $this;
    }

    public function jsonSerialize(): array
    {
        $json = [
            'routes_discovered' => $this->routesDiscovered,
            'spec_endpoints' => $this->specEndpoints,
            'coverage_percentage' => $this->getPercentage(),
        ];
        if (!empty($this->debugMessages)) {
            $json['debug'] = $this->debugMessages;
        }
        return $json;
    }
}
