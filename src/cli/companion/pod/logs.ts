import { getPods, login, tailLog } from "../../../interface/oc";
import { promptForOcProject, promptForOcResource } from "../../../interface/prompts";

export default {
  command: "logs",
  aliases: ["log"],
  describe: "Tail pods's logs",
  handler: async () => {
    login();
    const project = await promptForOcProject();

    const pods = getPods(project);
    const pod = await promptForOcResource(pods);

    tailLog(pod.metadata.name);
  }
};
