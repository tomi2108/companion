
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
    // const env = app_repo.env;
    // env.remove(key);
    // env.add(key, `http://localhost:${port}`);

    const { port, color, raw } = this.options;

    const { name } = await app_repo.getInfo();
    await app_repo.install();
    app_repo.dev(
      port,
      { raw, prefix: color?.(name) ?? name }
    );
    return {};
  }
}
