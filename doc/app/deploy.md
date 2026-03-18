# maro app deploy

Deploy a specific version of an app.

## Usage

```bash
maro app deploy
```

## Arguments

| Argument | Alias | Type | Description |
| -------- | ----- | ---- | ----------- |
| None     | None  | None | None |

## Notes

- Initiates and waits for the OpenShift pipeline associated with the selected deployment.
- Requires the following configuration key:
  - `paths.despliegues`: Path to deployment repositories (prompted if not set).
- Interacts with Git provider and OpenShift APIs.
- Alias: `maro app dep`
