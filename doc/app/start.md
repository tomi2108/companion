# maro app start

Start an app and its sub-apps locally.

## Usage

```bash
maro app start

# With raw logs
maro app start --raw
```

## Arguments

| Argument | Alias | Type    | Description                                                                 |
|----------|-------|---------|-----------------------------------------------------------------------------|
| `--raw`  | `-r`  | Boolean | Show raw logs instead of formatting as JSON and omitting non-JSON lines.     |

## Notes

- Identifies and configures dependent sub-apps by parsing environment variables for URLs, mapping them to other apps, and assigning unique local ports (starting from 8080).
- Runs installation for each app's dependencies.
- By default, logs are formatted as JSON, and non-JSON lines are omitted. Use the `--raw` flag to show unfiltered logs.
- The command requires the `paths.backend` configuration to be set to the backend repositories path.
- It interacts with the OpenShift API to retrieve project details and environment variables.
- The `STDOUT_LOGS=on` environment variable is added to all apps.
- Each app's logs are color-coded (blue, red, yellow, magenta, green, cyan) for better visibility.
- If an error occurs during execution, all child processes are terminated gracefully.
- The command assumes the `master` branch exists for Git operations like pulling and switching.
