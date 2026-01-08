
import chalk from "chalk";
import { Issue } from "sonarqube-web-api-client";

import { Dir } from "@files/dir";
import { AppRepo } from "@interface/dirs/app_repo";
import { ExecutionContext } from "@lib/ctx";
import { AppStatus } from "@workflow/steps/app/AppStatus";
import { GetDeployRepo } from "@workflow/steps/app/GetDeployRepo";
import { ForEach } from "@workflow/steps/flow/ForEach";
import { PromptOcProject } from "@workflow/steps/oc/projects/PromptOcProject";
import { Spinner } from "@workflow/steps/ui/Spinner";
import { Table } from "@workflow/steps/ui/Table";
import { Workflow } from "@workflow/workflow";

export default {
  command: "status",
  aliases: [],
  describe: "Show app status",
  handler: async () => {
    const ctx = ExecutionContext.get();
    const fe = ctx.config.paths.frontend;
    const be = ctx.config.paths.backend;
    const apps = [
      ...fe ? new Dir(fe).readDirs() : [],
      ...be ? new Dir(be).readDirs() : []
    ].map((d) => new AppRepo(d));

    await new Workflow([
      new PromptOcProject({ server: "cuyo" }),
      new Table({
        head: () => ["App", "Current version", "Last version", "Updated", "Mocked", "TODOS"],
        key: "health",
        style: { compact: true },
        // TODO: improve this typing. this is done by making "Workflow" class infer Writes from step[]
        map: ({ name, updated, todos, mocked, last_version, current_version }: {
          name: string;
          current_version: string;
          last_version: string;
          updated: string;
          mocked: string;
          todos: Issue[];
        }) => {
          const color = (s: string) => {
            if (s === "-") return chalk.yellow(s);
            if (s === "yes") return chalk.green(s);
            if (s === "no") return chalk.red(s);
            const isUpdated = current_version === last_version;
            return isUpdated ? chalk.green(s) : chalk.red(s);
          };
          return [
            name,
            color(current_version),
            color(last_version),
            color(updated),
            color(mocked),
            todos.length
          ];
        },
        // @ts-expect-error TODO mas arriba
        step: new Spinner({
          message: "Gathering status",
          step: new ForEach({
            item: "app_repo",
            items: () => apps,
            concurrency: 20,
            collectAs: "health",
            step: new Workflow([
              new GetDeployRepo(),
              new AppStatus()
            ])
          })
        })
      })
    ]).run(ctx);
  }
};
