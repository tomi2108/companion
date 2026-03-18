# maro env health

Detect missing environment variables in OpenShift deployments.

## Usage

```bash
maro env health [options]
```

## Arguments

| Argument | Alias | Type    | Description             |
| -------- | ----- | ------- | ----------------------- |
| --all    | -a    | boolean | Run for all repositories |

## Notes

- Excludes deployments listed in the `envs.health_exclusions` configuration key.
