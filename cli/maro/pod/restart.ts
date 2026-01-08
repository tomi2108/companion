import { Argv } from "yargs";

import { ExecutionContext } from "@lib/ctx";
import { Deployment } from "@oc/deployment";
import { Secret } from "@oc/secret";
import { ForEach } from "@steps/flow/ForEach";
import { If } from "@steps/flow/If";
import { DeploymentRestart } from "@steps/oc/deployments/DeploymentRestart";
import { GetDeployments } from "@steps/oc/deployments/GetDeployments";
import { PromptDeploymentSources } from "@steps/oc/deployments/PromptDeploymentSources";
import { PromptOcSecrets } from "@steps/oc/envs/PromptOcSecrets";
import { PromptOcProject } from "@steps/oc/projects/PromptOcProject";
import { Workflow } from "@workflow/workflow";

export default {
  command: "restart",
  aliases: [],
  describe: "Restart rollout for pod",
  builder: (yargs: Argv) => yargs
    .boolean("secret")
    .alias("secret", ["s"])
    .describe("secret", "Restart all deployments affected by a secret")
    .boolean("all")
    .alias("all", ["a"])
    .describe("all", "Whether to run the script for all repositories")
    .boolean("frontend")
    .alias("frontend", ["f"])
    .describe("frontend", "Whether to run the script for all frontend repositories")
    .boolean("backend")
    .alias("backend", ["b"])
    .describe("backend", "Whether to run the script for all backend repositories")
    .conflicts("all", ["frontend", "backend"]),
  handler: async ({
    secret,
    all,
    frontend,
    backend
  }: {
    secret?: boolean;
    all?: boolean;
    frontend?: boolean;
    backend?: boolean;
  }) => {
    const ctx = ExecutionContext.get();
    await new Workflow([
      new PromptOcProject({ server: "cuyo" }),
      new GetDeployments(),
      new If({
        condition: () => Boolean(secret),
        then: new PromptOcSecrets(),
        else: new PromptDeploymentSources({
          backend: all || backend,
          frontend: all || frontend
        })
      }),
      new ForEach({
        item: "deployment",
        items: ({ deployments, secret }: { deployments: Deployment[]; secret?: Secret }) =>
          deployments.filter(
            (d) => !secret ? true : d.getSecrets()?.some((s) => s.name === secret.name)
          ),
        step: new DeploymentRestart(),
        concurrency: true
      })
    ]).run(ctx);
  }
};
