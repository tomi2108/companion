# maro pod restart

Restart rollouts for deployments/pods in OpenShift.

## Usage

```bash
maro pod restart [options]
```

## Arguments

| Argument     | Alias | Type    | Description                                         |
| ------------ | ----- | ------- | --------------------------------------------------- |
| --secret     | -s    | boolean | Restart all deployments affected by a secret        |
| --all        | -a    | boolean | Run for all repositories                            |
| --frontend   | -f    | boolean | Run for all frontend repositories                   |
| --backend    | -b    | boolean | Run for all backend repositories                    |

## Notes

- Restarts can be targeted to specific deployments or those affected by a secret.
