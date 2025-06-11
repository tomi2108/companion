import { promptForMr } from "../../../interface/prompts";
import { Repo } from "../../../interface/repo";
import { getCurrentPath } from "../../../lib/utils";

export default {
  command: "merge",
  aliases: [],
  describe: "Merge merge request",
  handler: async () => {
    const full_path = getCurrentPath();
    const repo = new Repo(full_path);
    const mr = await promptForMr(repo);
    await mr.merge();
  }
};
