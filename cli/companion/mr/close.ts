import { Repo } from "@interface/files/repo";
import { promptForMr } from "@interface/prompts";
import { getCurrentPath } from "@lib/utils";

export default {
  command: "close",
  aliases: [],
  describe: "Close merge request",
  handler: async () => {
    const full_path = getCurrentPath();
    const repo = new Repo(full_path);
    const mr = await promptForMr(repo);
    await mr.close();
  }
};
