import { getOcToken, Openshift } from "../../../interface/oc/oc";
import { promptForOcResource } from "../../../interface/prompts";

export default {
  command: "logs",
  aliases: ["log"],
  describe: "Tail pods's logs",
  handler: async () => {

    const token = await getOcToken();
    const projects = await new Openshift(token).getProjects();
    const project = await promptForOcResource(projects);
    const pods = await project.getPods();
    const pod = await promptForOcResource(pods);

    // TODO: have a flag -r for raw logs and no flag for formatted logs
    await pod.followLogs();
  }
};
