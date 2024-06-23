# OpenAPI Coverage

This is a [Composer package](https://getcomposer.org) for PHP Applications and/or a GitHub Action for CI pipelines to check how many of your API endpoints are covered by an OpenAPI specification.

## :memo: Usage

```yaml
jobs:
  build:
    steps:
      - name: OpenAPI Coverage
        uses: vcampitelli/openapi-coverage@v1
```

## :arrow_backward: Inputs

Configure your step using `with`.

### `path`

- Description: Base path for the application
- Default: `.` (current working directory, where the repo is checked out)
- Example: if you have another repo checked out at `./repo2`:
    ```yaml
      - name: OpenAPI Coverage
        uses: vcampitelli/openapi-coverage@v1
        with:
          path: repo2
    ```

### `ignore-routes`

- Description: Ignore routes that match these regular expressions
- Default: Empty (every route is considered)
- Example: To ignore routes that start with either `/private/` or `/internal/`, use:
    ```yaml
      - name: OpenAPI Coverage
        uses: vcampitelli/openapi-coverage@v1
        with:
          ignore-routes: |
            ^/private/
            ^/internal/
    ```

### `spec`

- Description: Path for the OpenAPI specification file
- Default: It will look for `openapi.yaml`, `openapi.yml`, `docs/openapi.yaml` or `docs/openapi.yml` files in `path`
- Example: If you have the YAML file located at `utils/openapi.yaml`:
    ```yaml
      - name: OpenAPI Coverage
        uses: vcampitelli/openapi-coverage@v1
        with:
          spec: utils/openapi.yaml
    ```

### `debug`

- Description: Whether to enable verbose output
- Default: `false`
- Example: To understand what is happening under the hood:
    ```yaml
      - name: OpenAPI Coverage
        uses: vcampitelli/openapi-coverage@v1
        with:
          debug: true
    ```

## :arrow_forward: Outputs

| Parameter             | Type      | Description                                       |
|-----------------------|-----------|---------------------------------------------------|
| `routes_discovered`   | `integer` | How many application routes were discovered       |
| `endpoints_in_spec`   | `integer` | How many endpoints were found in the OpenAPI spec |
| `coverage_percentage` | `float`   | Coverage in percentage                            |
