import { Dir } from "@files/dir";
import { git } from "@glab/api";
import { Repo } from "@interface/dirs/repo";
import { promptForMr } from "@interface/prompts";
import log from "@lib/log/default";
import { getCurrentPath } from "@lib/utils";

export default {
  command: "diff",
  aliases: [],
  describe: "View merge request diff",
  handler: async () => {
    const dir = new Dir(getCurrentPath());
    const repo = new Repo(dir);
    const mr = await promptForMr(repo);
    if (!mr.source_branch) return log.error("Could not find source_branch");
    if (!mr.target_branch) return log.error("Could not find target_branch");
    const diff = await git(dir).diff(["--color", mr.target_branch, mr.source_branch]);
    log.info(diff);
  }
};
