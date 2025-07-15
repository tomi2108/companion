import { promptForOcResource } from "@interface/prompts";
import { Openshift } from "@oc";
import { getOcToken } from "@oc/api";
import { Argv } from "yargs";

export default {
  command: "restart",
  aliases: [],
  describe: "Restart rollout for pod",
  builder: (yargs: Argv) => yargs
    .boolean("secret")
    .alias("secret", ["s"])
    .describe("secret", "Restart all deployments affected by a secret"),
  handler: async ({ secret }: { secret?: boolean }) => {
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

    const deployment = await promptForOcResource(deployments);
    await deployment.restart();
  }
};
