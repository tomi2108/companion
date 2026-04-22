import cp from "node:child_process";

import { Dir } from "@lib/index";

type CommandOptions<T extends boolean = false> = {
  cwd: Dir;
  supressStdout?: T;
  env?: NodeJS.ProcessEnv;
};

export class CommandRunner {
  private bin = "";
  private args: string[] = [];

  constructor(bin: string) {
    this.bin = bin;
  }

  append(...args: string[]) {
    this.args = [...this.args, ...args];
    return this;
  }

  run<T extends boolean = false>(
    opts: CommandOptions<T>
  ): Promise<T extends true ? string : void> {
    return new Promise((resolve, reject) => {
      const child = cp.spawn(
        this.bin,
        this.args,
        {
          ...opts,
          cwd: opts.cwd.path,
          stdio: [
            "inherit",
            opts.supressStdout ? "pipe" : "inherit",
            "inherit"
          ]
        });

      let stdout = "";
      if (opts.supressStdout && child.stdout) {
        child.stdout.on("data", (chunk) => stdout += chunk);
      }

      child.on("error", reject);
      child.on("exit", (code) => {
        if (code === 0) resolve(
          (opts.supressStdout ? stdout : undefined) as T extends true ? string : void
        );
        else reject(
          new Error(`${this.bin} ${this.args.join(" ")} exited with ${code}`)
        );
      });
    });
  }
}

