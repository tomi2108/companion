# maro app start

Start the app and all sub-apps locally.

## Usage

```bash
maro app start [options]
```

## Arguments

| Argument | Alias | Type | Description |
| -------- | ----- | ---- | ----------- |
| --raw | -r | boolean | Show raw logs (omit JSON formatting) |

## Notes

- Requires backend app repositories to be correctly configured via `paths.backend`.
- Starts a local proxy on port 8080; sub-apps are assigned incremental ports.
