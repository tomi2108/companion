import { promptForMr } from "../../../interface/prompts";
import { Repo } from "../../../interface/files/repo";
import { getCurrentPath } from "../../../lib/utils";

export default {
  command: "approve",
  aliases: [],
  describe: "Approve merge request",
  handler: async () => {
    const full_path = getCurrentPath();
    const repo = new Repo(full_path);
    const mr = await promptForMr(repo);
    await mr.approve();
  }
};
