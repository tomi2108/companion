# companion app expose

Configures an application for exposure in 3scale by generating a YAML configuration file and managing Git operations.

## Usage

```bash
companion app expose
```

## Arguments

| Argument | Alias | Type | Description |
| ------------- | -------------- | -------------- | -------------- |
| None | None | None | This command does not accept any arguments. |

## Notes

- The command requires the following configurations:
  - `paths.threescale`: Path to the 3scale repository.
  - `threescale.products.<namespace>`: System name for the product in the selected namespace.
- If the app repository is not found, a warning is logged, and an empty description is used.
- The generated YAML file is of kind `abm-backend` with type `create`.
- Git operations are performed in the 3scale repository, including stashing, branching, committing, and creating a merge request.
- Available HTTP methods are limited to `GET` and `POST`.
