import { getOcToken, Openshift } from "../../../interface/oc/oc";
import { promptForOcResource } from "../../../interface/prompts";

export default {
  command: "logs",
  aliases: ["log"],
  describe: "Tail pods's logs",
  handler: async () => {
    // TODO: have a flag -r for raw logs

    const token = await getOcToken();
    const projects = await new Openshift(token).getProjects();
    const project = await promptForOcResource(projects);
    const deployments = await project.getDeployments();
    const deployment = await promptForOcResource(deployments);
    const pods = await deployment.getPods();
    pods.forEach((p) => p.followLogs());
  }
};
