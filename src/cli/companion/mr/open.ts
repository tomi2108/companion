import { promptForMr } from "../../../interface/prompts";
import { Repo } from "../../../interface/files/repo";
import { getCurrentPath } from "../../../lib/utils";

export default {
  command: "open",
  aliases: [],
  describe: "Open merge request in browser",
  handler: async () => {
    const full_path = getCurrentPath();
    const repo = new Repo(full_path);
    const mr = await promptForMr(repo);
    mr.openInBrowser();
  }
};
