import { Argv } from "yargs";
import { getOcToken, Openshift } from "../../../interface/oc/oc";
import { promptForOcResource } from "../../../interface/prompts";

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
    const project = await promptForOcResource(projects);
    const deployments = await project.getDeployments();
    const deployment = await promptForOcResource(deployments);
    const pods = await deployment.getPods();
    pods.forEach((p) => p.followLogs({ raw }));
  }
};
