import { Openshift } from "../../../interface/oc";
import { promptForOcResource } from "../../../interface/prompts";

export default {
  command: "restart",
  aliases: [],
  describe: "Restart rollout for pod",
  handler: async () => {

    const projects = await new Openshift().getProjects();
    const project = await promptForOcResource(projects);

    const deployments = await project.getDeployments();
    const deployment = await promptForOcResource(deployments);

    await deployment.restart();
  }
};
