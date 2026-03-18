# maro cron deploy

Deploy a new version of an existing OpenShift CronJob.

## Usage

```bash
maro cron deploy
```

## Arguments

| Argument | Alias | Type | Description |
| -------- | ----- | ---- | ----------- |
| None     | dep   | None | None        |

## Notes

- Requires `paths.namespaces` to be set in your configuration.
- Deploys the specified CronJob with new schedule or deployment details.
