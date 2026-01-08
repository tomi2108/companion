# dux app create

Create GitLab issues for app deployment in ArgoCD.

## Usage

```bash
dux app create
```

## Arguments

| Argument | Alias | Type | Description |
| ------------- | -------------- | -------------- | -------------- |
| None | None | None | This command does not accept any arguments. |

## Notes

- The command requires the following configuration paths to be set:
  - `paths.argocd`: Path to the ArgoCD repository.
  - `paths.backend`: Path to the backend repositories.
  - `paths.frontend`: Path to the frontend repositories.
- It interacts with the OpenShift API to retrieve available projects and the GitLab API to create issues.
- If the selected app's repository does not have any tags, the user will be prompted to manually enter a version.
