# maro project upgrade

Upgrade all apps in an OpenShift project to the latest version.

## Usage

```bash
maro project upgrade
```

## Arguments

| Argument | Alias | Type | Description |
| -------- | ----- | ---- | ----------- |
| None     | up    | None | None        |

## Notes

- Upgrades backend deployments to their latest available version.
- Executes upgrades concurrently across all eligible apps.
