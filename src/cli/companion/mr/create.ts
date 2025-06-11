#!/usr/bin/env node

import { getCurrentPath } from "../../../interface/files";
import { Repo } from "../../../interface/repo";
import { search } from "../../../lib/ui";

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
    // TODO : test
    await repo.createAndMergeMr(targetBranch);
  }
};
