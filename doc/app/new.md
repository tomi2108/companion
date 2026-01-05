# rishi app new

Create a new application from a predefined template.

## Usage

```bash
rishi app new
```

## Arguments

| Argument | Alias | Type | Description |
| ------------- | -------------- | -------------- | -------------- |
| None | None | None | This command does not accept any arguments. |

## Notes

- The command requires the following configuration paths to be set:
  - `paths.argocd`: Path to the ArgoCD repository.
  - `paths.backend`: Path to the backend repositories.
  - `paths.despliegues`: Path to the deployment repository.
  - `gitlab.repos.despliegues`: GitLab ID for the deployment repository.
  - `gitlab.repos.backend`: GitLab ID for the backend repository group.
  - `gitlab.ms_template_id`: GitLab ID for the microservice template repository.
- For `app` type, microfront creation is not yet implemented and will result in an error.
- For `int` type, the user must select a connection (`apigw` or `digit3`), which determines the configuration files used.
- The command performs Git operations (cloning, committing, pushing, creating merge requests) and interacts with OpenShift and GitLab APIs.
- If any pipeline (CI, Argo, or sync) fails, the command will log an error and stop.
- The initial version for the app is set to `v1.0.0`.
- For `fcd` type, additional 3scale exposure is planned but not yet implemented.
