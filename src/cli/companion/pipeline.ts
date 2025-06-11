import { login } from "../../interface/oc";
import { promptForOcResource, promptForOcProject } from "../../interface/prompts";
import { pipelineLogs, getPipelineRuns } from "../../interface/tkn";
import { Config } from "../../lib/config";

export default {
  command: "pipeline",
  aliases: ["pipe", "pipes", "pipe-log"],
  describe: "View pipelines logs",
  handler: async () => {
    login(Config.get().openshift.server_barracas);
    const project = await promptForOcProject();
    const pipes = getPipelineRuns(project);
    const pipe = await promptForOcResource(pipes);

    pipelineLogs(pipe.metadata.name);
  }
};
