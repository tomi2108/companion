# maro app new

Create a new app from template.

## Usage

```bash
maro app new
```

## Arguments

| Argument | Alias | Type | Description |
| -------- | ----- | ---- | ----------- |
| None | None | None | None |

## Notes

- Requires the following configuration keys:
  - `gitlab.repos.despliegues`
  - `paths.despliegues`
  - `paths.argocd`
  - For frontend app: `paths.frontend`, `gitlab.repos.frontend`
  - For backend app: `paths.backend`, `gitlab.repos.backend`
- Alias: `maro app n`
