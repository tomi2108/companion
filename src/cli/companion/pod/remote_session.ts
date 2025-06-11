import { getPods, login, remoteSession } from "../../../interface/oc";
import { promptForOcProject, promptForOcResource } from "../../../interface/prompts";

export default {
  command: "remote-session",
  aliases: ["rsh", "remote"],
  describe: "Start a remote session",
  handler: async () => {
    login();

    const project = await promptForOcProject();

    const pods = getPods(project);
    const pod = await promptForOcResource(pods);

    remoteSession(pod.metadata.name);
  }
};
