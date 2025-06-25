import { Repo } from "../../../interface/files/repo";
import { Config } from "../../../lib/config";
import { search, confirm, loading } from "../../../lib/ui";
import { getCurrentPath } from "../../../lib/utils";

export default {
  command: "create",
  aliases: [],
  describe: "Create and merge mr",
  handler: async () => {
    const full_path = getCurrentPath();
    const repo = new Repo(full_path);
    const branches = await repo.getBranches();
    const activeBranch = await repo.getActiveBranch();
    const targetBranches = branches.filter((b) => b !== activeBranch);
    const targetBranch = await search({ choices: targetBranches, message: "Choose target branch" });
    const default_reviewer = Config.get().gitlab.default_reviewer;
    const add_reviewer = await confirm({ initial: false, message: `Add default reviewer? (${default_reviewer})` });
    const merge = await confirm({ message: "Merge?" });

    if (!merge) {
      const spinner = loading("Building merge request");
      const mr = await repo.createMr(targetBranch, { reviewer: add_reviewer ? default_reviewer : undefined });
      spinner.succeed();
      const open = await confirm({ message: `Open ${mr.title} in browser?` });
      if (open) return mr.openInBrowser();
    }

    await repo.createAndMergeMr(targetBranch);
  }
};
