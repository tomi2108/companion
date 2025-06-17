import { Argv } from "yargs";
import { readdirs } from "../../../lib/utils";
import { Dirent } from "fs";
import { Config } from "../../../lib/config";
import { AppRepo } from "../../../interface/files/app_repo";
import path from "node:path";
import { input, search } from "../../../lib/ui";

export default {
  command: "level",
  aliases: [],
  describe: "Level two branches",
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
    .conflicts("all", ["frontend", "backend"])
    .conflicts("frontend", "backend"),
  handler: async ({ all, frontend, backend }: { all?: boolean; frontend?: boolean; backend?: boolean }) => {
    let paths: Dirent[] = [];
    if (all || frontend) paths = [...paths, ...readdirs(Config.get().paths.frontend) ?? []];
    if (all || backend) paths = [...paths, ...readdirs(Config.get().paths.backend) ?? []];

    if (paths.length === 0) {
      const choices = [
        ...readdirs(Config.get().paths.frontend) ?? [],
        ...readdirs(Config.get().paths.backend) ?? []
      ];
      const choice = await search({ choices: choices.map((p) => ({ name: path.join(p.path, p.name) })), message: "Select project" });
      const selected = choices.find((p) => choice === path.join(p.path, p.name));
      if (selected) paths = [selected];
    }

    const source_branch = await input({ message: "Input source branch" });
    const target_branch = await input({ message: "Input target branch" });

    for (const p of paths) {
      const full_path = path.join(p.parentPath, p.name);
      const repo = new AppRepo(full_path);
      await repo.stash(async () => {
        const { switched: switchedT } = await repo.switchBranchIfExists(target_branch);
        if (!switchedT) return;
        await repo.pull();

        const { switched: switchedS } = await repo.switchBranchIfExists(source_branch);
        if (!switchedS) return;
        await repo.pull();

        await repo.createNewBranch(`nivelacion/${source_branch}-${target_branch}`);
        await repo.createMr(target_branch, { title: `Nivelacion ${source_branch} - ${target_branch}` });
      });
    }
  }
};
