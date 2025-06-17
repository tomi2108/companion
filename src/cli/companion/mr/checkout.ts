import { promptForMr } from "../../../interface/prompts";
import { Repo } from "../../../interface/files/repo";
import log from "../../../lib/log";
import { getCurrentPath } from "../../../lib/utils";

export default {
  command: "checkout",
  aliases: [],
  describe: "Checkout merge request",
  handler: async () => {
    const full_path = getCurrentPath();
    const repo = new Repo(full_path);
    const mr = await promptForMr(repo);

    if (!mr.source_branch) {
      log.error("Could not find source_branch");
      process.exit(1);
    }

    await repo.checkout(mr.source_branch);
    await repo.pull(mr.source_branch);
  }
};
