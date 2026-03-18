import cp from "node:child_process";

import { FileFormatter } from "@files/formatters";

type ServiceOptions = {
  formatter: FileFormatter<unknown>;
  cwd: string;
  env?: NodeJS.ProcessEnv;
  prefix?: string;
};

export class ServiceProcess {

  constructor(
    private child: cp.ChildProcess,
    private opts: ServiceOptions
  ) {

  }

  start(): Promise<void> {
    const { prefix } = this.opts;
    const pre = prefix ? `[${prefix}]: ` : "";

    return new Promise((resolve, reject) => {
      this.child.stdout?.on("data", (data) => {
        let msg = data.toString().trim();

        const parsed = this.opts.formatter.tryFromString(msg);
        if (parsed) msg = this.opts.formatter.toString(parsed);

        if (msg) console.log(pre, msg);
      });

      this.child.stderr?.on("data", (data) => {
        console.error(pre, data.toString().trim());
      });

      this.child.on("error", reject);
      this.child.on("spawn", () => resolve());
    });
  }

  stop(signal: NodeJS.Signals = "SIGTERM") {
    this.child.kill(signal);
  }

  process() {
    return this.child;
  }
}

