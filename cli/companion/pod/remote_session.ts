import { promptForOcResource } from "@interface/prompts";
import { Openshift } from "@oc";
import { getOcToken } from "@oc/api";

export default {
  command: "remote-session",
  aliases: ["rsh", "remote"],
  describe: "Start a remote session",
  handler: async () => {

    const token = await getOcToken();
    const projects = await new Openshift(token).getProjects();
    const project = await promptForOcResource(projects);

    const pods = await project.getPods();
    const pod = await promptForOcResource(pods);
    pod.remoteSession();
  }
};
