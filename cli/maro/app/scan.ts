import chalk from "chalk";
import { Argv } from "yargs";

import { AppRepo } from "@interface/dirs/app_repo";
import { SonarProject } from "@interface/sonar/project";
import { ExecutionContext } from "@lib/ctx";
import { AppScan } from "@workflow/steps/app/AppScan";
import { PromptPaths } from "@workflow/steps/app/PromptPaths";
import { Effect } from "@workflow/steps/flow/Effect";
import { If } from "@workflow/steps/flow/If";
import { Table } from "@workflow/steps/ui/Table";
import { Workflow } from "@workflow/workflow";

export default {
  command: "scan",
  describe: "Run sonar scan",
  aliases: [],
  builder: (yargs: Argv) => yargs,
  handler: async () => {
    const ctx = ExecutionContext.get();
    await new Workflow([
      new PromptPaths({
        paths: ["frontend", "backend"],
        transform: ({ path }) => ({ app_repo: new AppRepo(path) })
      }),
      new Table({
        head: async ({ app_repo }) => {
          const { name } = await app_repo.getInfo();
          return [name, "Value", "", "Limit"];
        },
        map: ({ key, value, comparator, threshold, ok }) => {
          const color = ok ? chalk.green : chalk.red;
          return [key, color(value), color(comparator), color(threshold)];
        },
        key: "scan",
        style: { compact: true },
        step: new AppScan()
      }),
      new If({
        condition: () => ctx.ui.confirm({ message: "Open report in browser?" }),
        then: new Effect({
          effect: ({ project }: { project: SonarProject }) => project.openInBrowser()
        })
      })
    ]).run(ctx);
  }
};
