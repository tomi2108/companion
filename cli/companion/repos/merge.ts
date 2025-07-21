import { Dirent } from "node:fs";
import path from "node:path";
import { Argv } from "yargs";

import { AppRepo } from "@files/app_repo";
import { Config } from "@lib/config";
import { input, progressBar, search } from "@lib/ui";
import { readdirs } from "@lib/utils";

export default {
  command: "Merge",
  aliases: [],
  describe: "Merge two branches with an in between branch",
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

    const source_branch = await input({ message: "Input source branch" });
    const target_branch = await input({ message: "Input target branch" });

    const bar = progressBar(paths.length);
    for (const p of paths) {
      const full_path = path.join(p.parentPath, p.name);
      const repo = new AppRepo(full_path);
      const { name } = await repo.getInfo();
      bar.setSufix(name);
      await repo.stash(async () => {
        const temporary_branch = `nivelacion/${source_branch}-${target_branch}`;
        await repo.update();
        const { switched: switchedT, original_branch } = await repo.switchBranchIfExists(target_branch);
        if (!switchedT) return;
        await repo.pull(target_branch);

        const { switched: switchedS } = await repo.switchBranchIfExists(source_branch);
        if (!switchedS) return;
        await repo.pull(source_branch);

        await repo.createNewBranch(temporary_branch);
        await repo.createMr(target_branch, { title: `Nivelacion ${source_branch} - ${target_branch}` });
        await repo.switchBranchIfExists(original_branch);
        await repo.deleteBranch(temporary_branch);
      });
      bar.increment(1);
    }
    bar.stop();
  }
};
