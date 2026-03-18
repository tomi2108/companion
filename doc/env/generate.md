# maro env generate

Generate self-containing OpenShift configmaps for backend deployments.

## Usage

```bash
maro env generate [options]
```

## Arguments

| Argument | Alias | Type    | Description             |
| -------- | ----- | ------- | ----------------------- |
| --all    | -a    | boolean | Run for all repositories |

## Notes

- Respects exclusion lists from `envs.generate.exclusions` and `envs.generate.prefix_exclusions` config keys.
