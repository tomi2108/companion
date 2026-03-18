import chalk from "chalk";

import { AppRepo } from "@interface/dirs/app_repo";
import { SonarProject } from "@interface/sonar/project";
import { Command } from "@lib/index";
import { AppScan } from "@workflow/steps/app/AppScan";
import { PromptPaths } from "@workflow/steps/app/PromptPaths";
import { Effect } from "@workflow/steps/flow/Effect";
import { If } from "@workflow/steps/flow/If";
import { Table } from "@workflow/steps/ui/Table";
import { Workflow } from "@workflow/workflow";

const ScanCommand: Command = {
  name: "scan",
  description: "Run sonar scan",
  aliases: [],
  run: async ({ ctx }) => {
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

export default ScanCommand;
