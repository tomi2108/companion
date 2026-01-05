import { Dir } from "@files/dir";
import { Repo } from "@interface/dirs/repo";
import { promptForMr } from "@interface/prompts";
import log from "@lib/log/default";
import { getCurrentPath } from "@lib/utils";

export default {
  command: "checkout",
  aliases: [],
  describe: "Checkout merge request",
  handler: async () => {
    const dir = new Dir(getCurrentPath());
    const repo = new Repo(dir);
    const mr = await promptForMr(repo);

    if (!mr.source_branch) return log.error("Could not find source_branch");

    await repo.checkout(mr.source_branch);
    await repo.pull(mr.source_branch);
  }
};
