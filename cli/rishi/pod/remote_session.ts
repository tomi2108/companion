import { promptChoice } from "@interface/prompts";
import { Openshift } from "@oc";
import { getOcToken } from "@oc/api";

export default {
  command: "remote-session",
  aliases: ["rsh", "remote"],
  describe: "Start a remote session",
  handler: async () => {

    const token = await getOcToken();
    const projects = await new Openshift(token).getProjects();
    const project = await promptChoice(projects);

    const pods = await project.getPods();
    const pod = await promptChoice(pods);
    pod.remoteSession();
  }
};
