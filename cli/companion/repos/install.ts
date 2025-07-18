import { Dirent } from "node:fs";
import path from "node:path";
import { Argv } from "yargs";

import { AppRepo } from "@files/app_repo";
import { Config } from "@lib/config";
import log from "@lib/log";
import { input, progressBar, search } from "@lib/ui";
import { readdirs } from "@lib/utils";

export default {
  command: "install",
  aliases: [],
  describe: "Install/update dependencies",
  builder: (yargs: Argv) => yargs
    .boolean("all")
    .alias("all", ["a"])
    .describe("all", "Whether to run the script for all repositories")
    .boolean("frontend")
    .alias("frontend", ["f"])
    .describe("frontend", "Whether to run the script for all frontend repositories")
    .boolean("backend")
    .alias("backend", ["b"])
    .describe("backend", "Whether to run the script for all backend repositories")
    .conflicts("all", ["frontend", "backend"]),

  handler: async ({ all, frontend, backend }: { all?: boolean; frontend?: boolean; backend?: boolean }) => {
    let paths: Dirent[] = [];
    if (all || frontend) paths = [...paths, ...readdirs(Config.get().paths.frontend) ?? []];
    if (all || backend) paths = [...paths, ...readdirs(Config.get().paths.backend) ?? []];
    if (paths.length === 0) {
      const choices = [
        ...readdirs(Config.get().paths.frontend) ?? [],
        ...readdirs(Config.get().paths.backend) ?? []
      ];
      const choice = await search({ choices: choices.map((p) => ({ name: path.join(p.parentPath, p.name) })), message: "Select project" });
      const selected = choices.find((p) => choice === path.join(p.parentPath, p.name));
      if (selected) paths = [selected];
    }
    const nameLib = await input({ message: "Enter name dependency" });
    const versionLib = await input({ message: "Enter Versión" });
    const sourceBranch = await input({ message: "Source branch" });
    const bar = progressBar(paths.length, 0, "Installing");
    for (const p of paths) {
      const full_path = path.join(p.parentPath, p.name);
      bar.setSufix(p.name);
      const app_repo = new AppRepo(full_path);
      await app_repo.stash(async () => {
        const {switched} = await app_repo.switchBranchIfExists(sourceBranch);

        if (!switched) {
          log.warning("Source branch don't exist");
          return process.exit(1);
        }
        const new_branch_name = `bump/${nameLib}-${versionLib}`;
        await app_repo.createNewBranch(new_branch_name);
        await app_repo.switchBranchIfExists(new_branch_name);
        await app_repo.install([{name: nameLib, version: versionLib}]);
        await app_repo.add("package.json");
        await app_repo.commit(`feat: bump ${nameLib} to ${versionLib}`);
        await app_repo.createAndMergeMr(sourceBranch);
        await app_repo.switchBranchIfExists(sourceBranch);
        await app_repo.deleteBranch(new_branch_name);
      });
      bar.increment(1);
    }

    bar.stop();
  }};