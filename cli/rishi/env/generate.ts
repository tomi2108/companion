import { Argv } from "yargs";

import { ExecutionContext } from "@lib/ctx";
import { Deployment } from "@oc/deployment";
import { ForEach } from "@workflow/steps/flow/ForEach";
import { GetDeployments } from "@workflow/steps/oc/deployments/GetDeployments";
import { PromptDeploymentSources } from "@workflow/steps/oc/deployments/PromptDeploymentSources";
import { GenerateConfigMap } from "@workflow/steps/oc/envs/GenerateConfigMap";
import { PromptOcProject } from "@workflow/steps/oc/projects/PromptOcProject";
import { Workflow } from "@workflow/workflow";

export default {
  command: "generate",
  aliases: ["gen"],
  describe: "Generate self containing configmaps",
  builder: (yargs: Argv) => yargs
    .boolean("all")
    .alias("all", ["a"])
    .describe("all", "Whether to run the script for all repositories"),
  handler: async ({ all }: { all?: boolean }) => {
    const ctx = ExecutionContext.get();
    const config = ctx.config;
    const prefix = config.envs.generate?.prefix ?? "";
    const excluded = config.envs.generate?.exclusions ?? [];
    const excluded_prefix = config.envs.generate?.prefix_exclusions ?? [];

    await new Workflow([
      new PromptOcProject({ server: "cuyo" }),
      new GetDeployments({
        transform: ({
          deployments
        }) => ({
          deployments:
            deployments
              .filter((d) => !excluded.includes(d.name))
              .filter((d) => !excluded_prefix.some((p) => d.name.split(prefix)[1]?.startsWith(p)))
        })
      }),
      new PromptDeploymentSources({
        frontend: false,
        backend: all
      }),
      new ForEach({
        item: "deployment",
        items: (state: { deployments: Deployment[] }) => state.deployments,
        step: new GenerateConfigMap()
      })

    ]).run(ctx);
  }
};
