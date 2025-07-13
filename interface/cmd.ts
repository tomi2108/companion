import cp from "node:child_process";
import path from "node:path";

type Opts = {
  path: string;
  supressStdout?: boolean;
  args?: string[];
  cwd?: string;
};

export function executeScript(script: string, opts: Opts) {
  const full_path = path.join(opts.path, script);

  const result = cp.spawnSync(`${full_path}`, opts?.args, {
    cwd: opts?.cwd,
    stdio: ["inherit", opts?.supressStdout ? "pipe" : "inherit", "inherit"]
  });

  if (result.stdout) return result.stdout.toString();
  return "";
}

export function clearConsole() {
  process.stdout.write("\x1Bc");
}

