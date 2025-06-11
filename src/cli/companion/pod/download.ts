import { downloadLogs, getPods, login, getItemNamesFromResource } from "../../../interface/oc";
import { promptForOcProject, promptForOcResource } from "../../../interface/prompts";
import log from "../../../lib/log";

export default {
  command: "download-logs",
  aliases: ["dwnld", "download"],
  describe: "Download pod logs",
  handler: async () => {
    // TODO: migrate bash script
    login();

    const project = await promptForOcProject();

    const pods = getPods(project);
    const pods_names = getItemNamesFromResource(pods);
    const pod = await promptForOcResource(pods);

    downloadLogs(pod.metadata.name, `"${pods_names.join("\n").trim()}"`, project);
    log.success("Download completed");
  }
};
