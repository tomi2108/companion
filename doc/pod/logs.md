# maro pod logs

Tail real-time logs from OpenShift pods.

## Usage

```bash
maro pod logs [options]
```

## Arguments

| Argument | Alias | Type    | Description                                     |
| -------- | ----- | ------- | ----------------------------------------------- |
| --raw    | -r    | boolean | Show raw logs (otherwise formats as JSON only)  |

## Notes

- Allows following unfiltered or filtered pod logs as they are produced.
