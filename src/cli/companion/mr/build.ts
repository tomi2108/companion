import { getCurrentPath } from "../../../lib/utils";
import { Repo } from "../../../interface/repo";
import { confirm, search } from "../../../lib/ui";

export default {
  command: "build",
  aliases: [],
  describe: "Build merge request",
  handler: async () => {
    const full_path = getCurrentPath();
    const repo = new Repo(full_path);
    const branches = await repo.getBranches();
    const activeBranch = await repo.getActiveBranch();
    const targetBranches = branches.filter((b) => b !== activeBranch);
    const targetBranch = await search({ choices: targetBranches, message: "Choose target branch" });
    // TODO : test
    const mr = await repo.createMr(targetBranch);
    const open = await confirm({ message: `Open ${mr.title} in browser?` });
    if (open) mr.openInBrowser();
  }
};
