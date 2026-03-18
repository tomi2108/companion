# maro app create

Create GitLab issues for app deployment.

## Usage

```bash
maro app create
```

## Arguments

| Argument | Alias | Type | Description |
| -------- | ----- | ---- | ----------- |
| None     | None  | None | None |

## Notes

- Requires the following configuration keys:
  - `paths.backend`: Path to the backend repositories (prompted if not set).
  - `paths.frontend`: Path to the frontend repositories (prompted if not set).
- Interacts with the OpenShift API and GitLab API to create deployment issues.
- Alias: `maro app c`
