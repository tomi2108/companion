# dux repos clone

Clones all specified GitLab repositories into their respective directories as defined in the configuration.
If a repository already exists in the directory, it updates it.
The command uses concurrent operations with progress bars to track the cloning or updating process for each repository.

## Usage

```bash
dux repos clone
```

## Arguments

| Argument | Alias | Type | Description |
| ------------- | -------------- | -------------- | -------------- |
| None | None | None | This command does not accept any arguments. |

### Notes

- The repositories to clone and their respective paths are defined in the configuration file under `gitlab.repos` and `paths`.
- The command requires a valid GitLab configuration, including repository IDs and paths.
- If a repository ID or path is missing in the configuration, the command logs a warning and skips that repository.
- Directories are created if they do not exist before cloning.
