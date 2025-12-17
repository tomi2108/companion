import { Argv } from "yargs";

import { promptChoice } from "@interface/prompts";
import { Openshift } from "@oc";
import { getOcToken } from "@oc/api";

export default {
  command: "logs",
  aliases: ["log"],
  describe: "Tail pods's logs",
  builder: (yargs: Argv) => yargs
    .boolean("raw")
    .alias("raw", ["r"])
    .describe("raw", "Whether to show raw logs, by default logs are formatted as JSON, and every line which is not valid JSON is omitted from logs"),
  handler: async ({ raw }: { raw?: boolean }) => {
    const token = await getOcToken();
    const projects = await new Openshift(token).getProjects();
    const project = await promptChoice(projects);
    const deployments = await project.getDeployments();
    const deployment = await promptChoice(deployments);
    const pods = await deployment.getPods();
    await Promise.all(pods.map((p) => p.followLogs({ raw })));
  }
};
