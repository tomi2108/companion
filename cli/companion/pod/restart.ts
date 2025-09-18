import { Argv } from "yargs";

import { promptForOcResource } from "@interface/prompts";
import { Openshift } from "@oc";
import { filterFrontendDeployments, getOcToken } from "@oc/api";
import { Deployment } from "@oc/deployment";

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
    const project = await promptForOcResource(projects);
    const deployments = await project.getDeployments();

    if (secret) {
      const secrets = await project.getSecrets();
      const s = await promptForOcResource(secrets);
      for (const d of deployments) {
        if (!d.getSecrets()?.some((ss) => ss.name === s.name)) continue;
        await d.restart();
      }
      return;
    }

    let to_restart: Deployment[] = [];
    if (all || frontend) to_restart = [...to_restart, ...deployments.filter(filterFrontendDeployments)];
    if (all || backend) to_restart = [...to_restart, ...deployments.filter((d) => !filterFrontendDeployments(d))];

    if (to_restart.length === 0) {
      const deployment = await promptForOcResource(deployments);
      if (deployment) to_restart = [deployment];
    }
    await Promise.all(to_restart.map((d) => d.restart()));
  }
};
