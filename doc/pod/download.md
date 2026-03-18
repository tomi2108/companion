# maro pod download

Download logs from OpenShift pods.

## Usage

```bash
maro pod download [options]
```

## Arguments

| Argument | Alias          | Type    | Description                                                |
| -------- | -------------- | ------- | ---------------------------------------------------------- |
| --raw    | -r             | boolean | Download raw logs, do not filter as JSON (default: false)  |

## Notes

- Allows downloading filtered or unfiltered pod logs from OpenShift clusters.
