import { Dirent } from "node:fs";
import path from "node:path";
import { Argv } from "yargs";

import { AppRepo } from "@files/app_repo";
import { Config } from "@lib/config";
import { input, search } from "@lib/ui";
import { readdirs } from "@lib/utils";

export default {
  command: "rename",
  aliases: [],
  describe: "Open app in browser",
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

    const branch = await input({ message: "Input branch" });
    const name_template = await input({ message: "Input new name (use {{name}} as a replacement for repo name)" });
    await Promise.all(
      paths.map(
        async (p) => {
          const full_path = path.join(p.parentPath, p.name);
          const repo = new AppRepo(full_path);
          await repo.stash(async () => {
            let return_branch = null;
            if (await repo.getActiveBranch() !== branch) {
              const { original_branch } = await repo.switchBranchIfExists(branch);
              return_branch = original_branch;
            }
            const { name } = await repo.getInfo();
            const new_name = name_template.replaceAll("{{name}}", name);
            repo.package = new_name;
            repo.save();
            await repo.add(repo.package_file);
            const commit = await repo.commit(`fix: rename to ${new_name}`);
            if (!commit) return;
            await repo.push(branch);
            if (return_branch) await repo.switchBranchIfExists(return_branch);
          });
        }
      )
    );
  }
};
