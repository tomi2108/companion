# rishi repos merge

Creates a merge request to merge a source branch into a target branch for selected repositories
using a temporary in between branch.

## Usage

```bash
# Merge branches for all repositories
rishi repos merge --all

# Merge branches for frontend repositories only
rishi repos merge --frontend

# Merge branches for backend repositories only
rishi repos merge --backend

# Merge branches for a single repository selected interactively
rishi repos merge 
```

## Arguments

| Argument     | Alias | Type    | Description                                      |
|--------------|-------|---------|--------------------------------------------------|
| `--all`      | `-a`  | Boolean | Run the script for all repositories.             |
| `--frontend` | `-f`  | Boolean | Run the script for all frontend repositories.    |
| `--backend`  | `-b`  | Boolean | Run the script for all backend repositories.     |

### Notes

- The `--all` flag conflicts with `--frontend` and `--backend`. You cannot combine `--all` with specific repository flags.
- If no flags are provided, the command prompts the user to select a single repository interactively.
- The command performs the following Git operations for each repository:
  - Stashes any local changes.
  - Switches to the target branch and pulls the latest changes.
  - Switches to the source branch and pulls the latest changes.
  - Creates a temporary branch based on the source branch.
  - Creates a merge request from the temporary branch to the target branch.
  - Switches back to the original branch.
  - Deletes the temporary branch.
- Only repositories that have both the specified source and target branches will be processed.
