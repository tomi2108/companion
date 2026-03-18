import chalk from "chalk";

import { Config } from "@lib/config";
import { Command } from "@lib/index";
import { Deployment } from "@oc/deployment";
import { GetAppRepo } from "@workflow/steps/app/GetAppRepo";
import { GetDeployRepo } from "@workflow/steps/app/GetDeployRepo";
import { EnvHealth } from "@workflow/steps/env/EnvHealth";
import { ForEach } from "@workflow/steps/flow/ForEach";
import { GetDeployments } from "@workflow/steps/oc/deployments/GetDeployments";
import { PromptDeploymentSources } from "@workflow/steps/oc/deployments/PromptDeploymentSources";
import { PromptOcProject } from "@workflow/steps/oc/projects/PromptOcProject";
import { Table } from "@workflow/steps/ui/Table";
import { Workflow } from "@workflow/workflow";

const HealthEnvCommand: Command = {
  name: "health",
  aliases: ["h"],
  description: "Detect missing envs in deployment",
  options: [
    {
      name: "all",
      type: "boolean",
      description: "Whether to run the script for all repositories",
      aliases: ["a"]
    }
  ],
  run: async ({ ctx, args }) => {
    const all = args?.all;
    const config = Config.getView();
    await new Workflow([
      new PromptOcProject({ server: "cuyo" }),
      new GetDeployments(),
      new PromptDeploymentSources({
        backend: all
      }),
      new ForEach({
        item: "deployment",
        items: (state: { deployments: Deployment[] }) => state.deployments.filter((d) => {
          return !config.get("envs.health_exclusions").includes(d.name);
        }),
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

export default HealthEnvCommand;
