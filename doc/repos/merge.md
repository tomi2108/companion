# maro repos merge

Merge two branches with an intermediate branch, across multiple repositories.

## Usage

```bash
maro repos merge [options]
```

## Arguments

| Argument     | Alias | Type    | Description                        |
| ------------ | ----- | ------- | ---------------------------------- |
| --all        | -a    | boolean | Run for all repositories           |
| --frontend   | -f    | boolean | Run for all frontend repositories  |
| --backend    | -b    | boolean | Run for all backend repositories   |

## Notes

- Skips any repositories listed in the `repos.merge.ignores` configuration.
- Requires repository configuration for frontend or backend to be present.
