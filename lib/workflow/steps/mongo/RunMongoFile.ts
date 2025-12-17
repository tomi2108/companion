import { Dir } from "@files/dir";
import { TextFile } from "@files/text_file";
import { executeScript } from "@interface/cmd";
import { AppRepo } from "@interface/dirs/app_repo";
import { ExecutionContext } from "@lib/ctx";
import { loading } from "@lib/ui";
import { Project } from "@oc/project";

import { WorkflowOptions, WorkflowStep } from "..";
import { ValidateConfig } from "../config/ValidateConfig";

type Reads = { mongo_file: TextFile; project: Project };
type Writes = {
  log_file: { name: string; dir: Dir; log: string };
};
type Options = {};

export class RunMongoFile extends WorkflowStep<Reads, Writes, Options> {

  constructor(override options?: WorkflowOptions<Options, Writes>) {
    super(options);
  }

  async run(ctx: ExecutionContext, { mongo_file, project }: Reads) {
    new ValidateConfig({ keys: ["paths.mongo"] }).run(ctx);
    const config = ctx.config;
    const mongo_path = config.paths.mongo;
    const migration_secrets = config.migrations.secrets ?? [];

    const dir = new Dir(mongo_path!);
    const repo = new AppRepo(dir);

    if (!dir.sub("node_modules").exists()) {
      const spinner = loading("Installing missing dependencies");
      await repo.install();
      spinner.succeed();
    }
    const secrets = await project.getSecrets();
    const env = (
      await Promise.all(
        secrets
          .filter((s) => migration_secrets.includes(s.name))
          .map((s) => s.getData()
          )
      )).reduce((acc, curr) => ({ ...acc, ...curr }));

    const output = executeScript("node", {
      path: "",
      env,
      supressStdout: true,
      args: [mongo_file.path],
      cwd: dir.path
    });

    const log_dir = new Dir("mongo").sub("scripts", mongo_file.name({ extension: false }));
    return { log_file: { name: new Date().toISOString(), dir: log_dir, log: output } };
  }
}
