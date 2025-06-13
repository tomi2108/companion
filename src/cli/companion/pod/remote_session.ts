import { Openshift } from "../../../interface/oc/oc";
import { promptForOcResource } from "../../../interface/prompts";

export default {
  command: "remote-session",
  aliases: ["rsh", "remote"],
  describe: "Start a remote session",
  handler: async () => {

    const projects = await new Openshift().getProjects();
    const project = await promptForOcResource(projects);

    const pods = await project.getPods();
    const pod = await promptForOcResource(pods);
    pod.remoteSession();
  }
};
