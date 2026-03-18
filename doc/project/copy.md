# maro project copy

Copy all missing apps from one OpenShift project to another.

## Usage

```bash
maro project copy
```

## Arguments

| Argument | Alias | Type | Description |
| -------- | ----- | ---- | ----------- |
| None     | cp    | None | None        |

## Notes

- Only apps not present in the target project and not in `project.copy.exclusions` (from config) will be copied.
- Handles deployments in bulk and uses concurrency for faster execution.
