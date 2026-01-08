import chalk from "chalk";
import { Argv } from "yargs";

import { ExecutionContext } from "@lib/ctx";
import { Deployment } from "@oc/deployment";
import { GetAppRepo } from "@workflow/steps/app/GetAppRepo";
import { GetDeployRepo } from "@workflow/steps/app/GetDeployRepo";
import { EnvHealth } from "@workflow/steps/env/EnvHealth";
import { ForEach } from "@workflow/steps/flow/ForEach";
import { PromptDeploymentSources } from "@workflow/steps/oc/deployments/PromptDeploymentSources";
import { PromptOcProject } from "@workflow/steps/oc/projects/PromptOcProject";
import { Table } from "@workflow/steps/ui/Table";
import { Workflow } from "@workflow/workflow";

export default {
  command: "health",
  aliases: ["h"],
  describe: "Detect missing envs in deployment",
  builder: (yargs: Argv) => yargs
    .boolean("all")
    .alias("all", ["a"])
    .describe("all", "Whether to run the script for all all repositories"),
  handler: async ({ all }: { all?: boolean }) => {
    const ctx = ExecutionContext.get();
    await new Workflow([
      new PromptOcProject({ server: "cuyo" }),
      new PromptDeploymentSources({ backend: all }),
      new ForEach({
        item: "deployment",
        items: (state: { deployments: Deployment[] }) => state.deployments,
        step: new Workflow([
          new GetDeployRepo(),
          new GetAppRepo(),
          new Table({
            key: "envs",
            step: new EnvHealth(),
            head: ({ deployment }: { deployment: Deployment }) => [deployment.name, "Status"],
            map: (item) => {
              const color = item.status === "missing" ? chalk.red : chalk.yellow;
              return [item.key, color(item.status)];
            },
            width: [50]
          })
        ])
      })
    ]).run(ctx);
  }
};
