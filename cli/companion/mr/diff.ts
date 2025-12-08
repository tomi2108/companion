import { git } from "@glab/api";
import { Repo } from "@interface/dirs/repo";
import { promptForMr } from "@interface/prompts";
import log from "@lib/log";
import { getCurrentPath } from "@lib/utils";

export default {
  command: "diff",
  aliases: [],
  describe: "View merge request diff",
  handler: async () => {
    const full_path = getCurrentPath();
    const repo = new Repo(full_path);
    const mr = await promptForMr(repo);
    if (!mr.source_branch) return log.error("Could not find source_branch");
    if (!mr.target_branch) return log.error("Could not find target_branch");
    const diff = await git(repo.full_path).diff(["--color", mr.target_branch, mr.source_branch]);
    log.info(diff);
  }
};
