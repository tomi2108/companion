import chalk from "chalk";
import Table from "cli-table3";
import { Argv } from "yargs";

import { getApp } from "@files";
import { TextFile } from "@files/text_file";
import { Config } from "@lib/config";
import { ExecutionContext } from "@lib/ctx";
import log from "@lib/log/default";
import { Deployment } from "@oc/deployment";
import { GetAppRepo } from "@workflow/steps/app/GetAppRepo";
import { GetDeployRepo } from "@workflow/steps/app/GetDeployRepo";
import { EnvHealth } from "@workflow/steps/env/EnvHealth";
import { ForEach } from "@workflow/steps/flow/ForEach";
import { PromptDeploymentSources } from "@workflow/steps/oc/deployments/PromptDeploymentSources";
import { PromptOcProject } from "@workflow/steps/oc/projects/PromptOcProject";
import { Workflow } from "@workflow/workflow";
import { GetDeployments } from "@workflow/steps/oc/deployments/GetDeployments";

const status = {
  UNUSED: "unused",
  MISSING: "missing"
} as const;

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
      new PromptDeploymentSources({
        backend: all
      }),
      new ForEach({
        item: "deployment",
        items: (state: { deployments: Deployment[] }) => state.deployments,
        step: new Workflow([
          new GetDeployRepo(),
          new GetAppRepo(),
          new EnvHealth()
        ])
      })
    ]).run(ctx);

  }
};
