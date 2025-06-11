#!/usr/bin/env node

import { getCurrentPath } from "../../../interface/files";
import { promptForMr } from "../../../interface/prompts";
import { Repo } from "../../../interface/repo";

export default {
  command: "merge",
  aliases: [],
  describe: "Merge merge request",
  handler: async () => {
    const full_path = getCurrentPath();
    const repo = new Repo(full_path);
    const mr_id = await promptForMr(repo);

    await repo.merge(Number(mr_id));
  }
};
