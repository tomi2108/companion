# maro env edit

Edit an OpenShift configmap or secret.

## Usage

```bash
maro env edit
```

## Arguments

| Argument | Alias | Type | Description |
| -------- | ----- | ---- | ----------- |
| None     | e     | None | None        |

## Notes

- Requires `paths.namespaces` to be set in your configuration.
- If you choose, will restart deployments affected by the edited resource.
