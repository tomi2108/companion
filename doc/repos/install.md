# dux repos install

Installs or updates dependencies in selected repositories.
It supports targeting all repositories, frontend repositories, backend repositories,
or a single repository selected interactively.
The command handles the installation process, including creating a new branch, committing changes, and creating a merge request.

## Usage

```bash
# Install a dependency in all repositories:
dux repos install --all

# Install a dependency only in frontend repositories:
dux repos install --frontend

# Install as a dev dependency in backend repositories:
dux repos install --backend --dev

# Install a dependency in a single repository selected interactively:
dux repos install
```

## Arguments

| Argument     | Alias | Type    | Description                                      |
|--------------|-------|---------|--------------------------------------------------|
| `--all`      | `-a`  | Boolean | Install in all repositories (frontend and backend). |
| `--frontend` | `-f`  | Boolean | Install only in frontend repositories.           |
| `--backend`  | `-b`  | Boolean | Install only in backend repositories.            |
| `--dev`      | `-d`  | Boolean | Install as a dev dependency.                     |

### Notes

- The `--all` flag conflicts with `--frontend` and `--backend`. You cannot combine `--all` with specific repository flags.
- If no repository flags are provided, the command prompts the user to select a single repository interactively.
- The command performs Git operations: stashing changes, switching branches, creating a new branch, committing changes, creating a merge request, and deleting the temporary branch.
