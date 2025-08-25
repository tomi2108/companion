import { promptForOcResource } from "@interface/prompts";
import { search } from "@lib/ui";
import { Openshift } from "@oc";
import { getOcToken } from "@oc/api";

const servers = ["brc", "cuyo"] as const;

export default {
  command: "pipeline",
  aliases: ["pipe", "pipes", "pipe-log"],
  describe: "View pipelines logs",
  handler: async () => {
    const server = (await search({ choices: [...servers], message: "Choose server" })) as typeof servers[number];
    const token = await getOcToken(server);
    const projects = await new Openshift(token, server).getProjects();

    const project = await promptForOcResource(projects);
    const pipelines = await project.getPipelineRuns();
    const pipeline = await promptForOcResource(pipelines);
    await pipeline.followLogs();
  }
};
