# OpenAPI Coverage

## :memo: Usage

```yaml
jobs:
  build:
    steps:
      - name: OpenAPI Coverage
        uses: vcampitelli/openapi-coverage@v1
```

### :arrow_backward: Inputs (using `with`)

#### `path`

- Description: Base path for the application
- Default: Current working directory (where the repo is checked out)

#### `filter-routes`

- Description: Ignore routes that match these regular expressions
- Default: Empty
- Example: To filter routes that start with either `/private/` or `/internal/`, use:
    ```yaml
      - name: OpenAPI Coverage
        uses: vcampitelli/openapi-coverage@v1
        with:
          filter-routes: |
            ^/private/
            ^/internal/
    ```

#### `spec`

- Description: Filepath for the OpenAPI spec
- Default: It will look for `openapi.yaml`, `openapi.yml`, `docs/openapi.yaml` or `docs/openapi.yml` files in `path`

#### `debug`

- Description: Whether to enable verbose output
- Default: `false`


### :arrow_forward: Outputs

| Parameter             | Type      | Description                                       |
|-----------------------|-----------|---------------------------------------------------|
| `routes_discovered`   | `integer` | How many application routes were discovered       |
| `endpoints_in_spec`   | `integer` | How many endpoints were found at the OpenAPI spec |
| `coverage_percentage` | `float`   | Coverage in percentage                            |
