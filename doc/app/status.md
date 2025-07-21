# companion app status

Retrieves and displays the status of applications deployed in a chosen OpenShift project.
It presents the information in a tabular format with the following columns:

- **App**: The name of the application.
- **Current version**: The version currently deployed in the selected project.
- **Last version**: The latest version available in the app's repository.
- **Mocked**: Indicates whether the deployment uses mock secrets (`yes` or `no`).
- **TODOS**: The number of TODO code smells identified in the SonarQube project.

## Usage

```bash
companion app status
```

## Arguments

| Argument | Alias | Type | Description |
| ------------- | -------------- | -------------- | -------------- |
| None | None | None | This command does not accept any arguments. |

## Notes

- The command requires access to the OpenShift API for project and deployment details, SonarQube API for code smell data, and Git repositories for version information.
- The `openshift.mock_secrets` configuration must be set to identify mock secrets.
- If an app or deploy repository cannot be found, a warning is logged, and the app is skipped.
- If a deployment file is missing for an app in the selected project, a warning is logged.
- For frontend repositories, the latest version logic is incomplete and requires handling of `-beta` or `-rc` tags based on the project (to be implemented).
- The table is sorted alphabetically by app name for clarity.
