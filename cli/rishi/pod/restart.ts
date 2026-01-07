import { Argv } from "yargs";

import { ExecutionContext } from "@lib/ctx";
import { Openshift } from "@oc";
import { filterFrontendDeployments, getOcToken } from "@oc/api";
import { Deployment } from "@oc/deployment";
import { Secret } from "@oc/secret";
import { ForEach } from "@workflow/steps/flow/ForEach";
import { If } from "@workflow/steps/flow/If";
import { DeploymentRestart } from "@workflow/steps/oc/deployments/DeploymentRestart";
import { GetDeployments } from "@workflow/steps/oc/deployments/GetDeployments";
import { PromptOcSecret } from "@workflow/steps/oc/envs/PromptOcSecrets";
import { PromptOcProject } from "@workflow/steps/oc/projects/PromptOcProject";
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
    const token = await getOcToken();
    const projects = await new Openshift(token).getProjects();
    const project = await promptChoice(projects);
    const deployments = await project.getDeployments();

    const ctx = ExecutionContext.get();
    await new Workflow([
      new PromptOcProject({ server: "cuyo" }),
      new GetDeployments(),
      new If({
        condition: () => Boolean(secret),
        then: new PromptOcSecret()
      }),
      new ForEach({
        item: "deployment",
        items: ({ deployments, secret }: { deployments: Deployment[]; secret?: Secret }) =>
          deployments.filter(
            (d) => !secret ? true : d.getSecrets()?.some((s) => s.name === secret.name)
          ),
        step: new DeploymentRestart(),
        concurrency: 10
      })
    ]).run(ctx);

    let to_restart: Deployment[] = [];
    if (all || frontend) to_restart = [...to_restart, ...deployments.filter(filterFrontendDeployments)];
    if (all || backend) to_restart = [...to_restart, ...deployments.filter((d) => !filterFrontendDeployments(d))];

    if (to_restart.length === 0) {
      const deployment = await promptChoice(deployments);
      if (deployment) to_restart = [deployment];
    }
    await Promise.all(to_restart.map((d) => d.restart()));
  }
};
