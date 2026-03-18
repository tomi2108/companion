# maro repos install

Install or update dependencies across multiple repositories.

## Usage

```bash
maro repos install [options]
```

## Arguments

| Argument     | Alias | Type    | Description                        |
| ------------ | ----- | ------- | ---------------------------------- |
| --dev        | -d    | boolean | Install as dev dependency          |
| --all        | -a    | boolean | Run for all repositories           |
| --frontend   | -f    | boolean | Run for all frontend repositories  |
| --backend    | -b    | boolean | Run for all backend repositories   |

## Notes

- Requires frontend and/or backend repository paths to be configured.
