# companion repos clean

Cleans Git repositories by deleting branches matching specific patterns (e.g., `nivelacion`, `feature`, `bugfix`, `hotfix`, `fix`, `despliegue`) in the specified repositories. If no repositories are specified, it prompts the user to select a project and confirm the action. A progress bar tracks the cleaning process for multiple repositories.

## Usage

Run the command in a terminal from the project root. The command can be invoked with various flags to specify which repositories to clean.

### Example

```bash
# Clean all repositories
companion repos clean --all

# Clean only frontend repositories
companion repos clean --frontend

# Clean a specific repository by selecting it interactively
companion repos clean
```

| Argument | Alias | Type | Description |
| ------------- | -------------- | -------------- | -------------- |
| --all | -a | Boolean | Cleans all repositories (frontend, backend, and deployment). |
| --frontend | -f | Boolean | Cleans only frontend repositories. |
| --backend | -b | Boolean | Cleans only backend repositories. |
| --despliegues | -d | Boolean | Cleans only deployment (despliegues) repositories. |

## Notes

- The --all flag conflicts with --frontend, --backend, and --despliegues. You cannot combine --all with any of the specific repository flags.
- If no flags are provided, the command prompts the user to select a single repository to clean.
- The command requires confirmation before proceeding with cleaning to prevent accidental branch deletion.
