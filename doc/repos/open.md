# companion repos open

Opens selected Git repositories in the configured code editor. The command prompts the user to select one or more projects from the frontend, backend, or deployment repositories, then opens each selected project in the editor.

## Usage

```bash
# Open one or more repositories by selecting them interactively

companion repos open
```

| Argument | Alias | Type | Description |
| ------------- | -------------- | -------------- | -------------- |
| None | None | None | This command does not accept any arguments. |

## Notes

- The command uses an interactive multi-select interface to choose repositories from the configured frontend, backend, and deployment paths.
- If no projects are selected, the command exits without performing any actions.
- The editor used is determined by the configuration in `preferences.editor` or `$EDITOR`
