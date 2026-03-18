import { JsonFormatter } from "@files/formatters/json_formatter";
import { StringFormatter } from "@files/formatters/string_formatter";
import { AppRepo } from "@interface/dirs/app_repo";
import { ExecutionContext } from "@lib/ctx";

import { WorkflowOptions, WorkflowStep } from "..";

type Reads = { app_repo: AppRepo };
type Writes = {};
type Options = {
  port: number;
  raw?: boolean;
  color?: (s: string) => string;
};

export class AppStart extends WorkflowStep<Reads> {

  constructor(override options: WorkflowOptions<Options, Writes>) {
    super(options);
  }

  async run(_: ExecutionContext, { app_repo }: Reads) {
    // TODO(20260318-002457): this should be done on other apps
    // const env = app_repo.env;
    // env.remove(key);
    // env.add(key, `http://localhost:${port}`);

    const { port, color, raw } = this.options;
    const { name } = await app_repo.getInfo();
    await app_repo.install();
    const formatter = raw ? new StringFormatter() : new JsonFormatter();
    const server = app_repo.dev(port, { formatter, prefix: color?.(name) ?? name });
    server.start();
    return {};
  }
}