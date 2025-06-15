import { promptForOcResource } from "../../interface/prompts";
import { getOcToken, Openshift } from "../../interface/oc/oc";

export default {
  command: "pipeline",
  aliases: ["pipe", "pipes", "pipe-log"],
  describe: "View pipelines logs",
  handler: async () => {
    const token = await getOcToken("brc");
    const projects = await new Openshift(token, "brc").getProjects();

    const project = await promptForOcResource(projects);
    const pipelines = await project.getPipelineRuns();
    const pipeline = await promptForOcResource(pipelines);
    console.log(await pipeline.getLogs());
  }
};
