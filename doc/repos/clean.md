# maro repos clean

Clean repositories by removing generated files and resetting local changes.

## Usage

```bash
maro repos clean [options]
```

## Arguments

| Argument       | Alias | Type    | Description                        |
| -------------- | ----- | ------- | ---------------------------------- |
| --all          | -a    | boolean | Run for all repositories           |
| --frontend     | -f    | boolean | Run for all frontend repositories  |
| --backend      | -b    | boolean | Run for all backend repositories   |
| --despliegues  | -d    | boolean | Run for all despliegues repositories |
| --force        |       | boolean | Force clean (skip confirmations)   |

## Notes

- Requires repository paths for --frontend, --backend, or --despliegues to be properly configured.
