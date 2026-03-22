import chalk from "chalk";

import { AppRepo } from "@interface/dirs/app_repo";
import { Dir } from "@interface/dirs/dir";
import { Config } from "@lib/config";
import { Command } from "@lib/index";
import { AppStatus } from "@workflow/steps/app/AppStatus";
import { GetDeployRepo } from "@workflow/steps/app/GetDeployRepo";
import { ForEach } from "@workflow/steps/flow/ForEach";
import { PromptOcProject } from "@workflow/steps/oc/projects/PromptOcProject";
import { PromptOcServer } from "@workflow/steps/oc/servers/PromptOcServer";
import { Spinner } from "@workflow/steps/ui/Spinner";
import { Table } from "@workflow/steps/ui/Table";
import { Workflow } from "@workflow/workflow";

const StatusCommand: Command = {
  name: "status",
  aliases: [],
  description: "Show app status",
  run: async ({ ctx }) => {
    const config = Config.getView();
    const fe = config.get("paths.frontend");
    const be = config.get("paths.backend");
    const apps = [
      ...fe ? new Dir(fe).readDirs() : [],
      ...be ? new Dir(be).readDirs() : []
    ].map((d) => new AppRepo(d));

    await new Workflow([
      new PromptOcServer(),
      new PromptOcProject(),
      new Table({
        sortByColumn: { index: 0, direction: "asc" },
        head: () => ["App", "Current version", "Last version", "Updated", "Mocked"],
        key: "health",
        style: { compact: true },
        // TODO(20260318-002430): improve this typing. this is done by making "Workflow" class infer Writes from step[]
        map: ({ name, updated, mocked, last_version, current_version }: {
          name: string;
          current_version: string;
          last_version: string;
          updated: string;
          mocked: string;
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
            color(mocked)
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
              new GetDeployRepo({ throw: false }),
              new AppStatus()
            ])
          })
        })
      })
    ]).run(ctx);
  }
};

export default StatusCommand;
