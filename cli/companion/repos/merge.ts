import { Argv } from "yargs";

import { Dir } from "@files/dir";
import { AppRepo } from "@interface/dirs/app_repo";
import { Config } from "@lib/config";
import log from "@lib/log";
import { input, progressBar, search } from "@lib/ui";

export default {
  command: "merge",
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
    const config = Config.get();
    const sources = [
      all || frontend ? config.paths.frontend : undefined,
      all || backend ? config.paths.backend : undefined
    ].filter(Boolean) as string[];

    let dirs: Dir[] = sources.flatMap(
      (p) => new Dir(p).readDirs()
    );

    if (dirs.length === 0) {
      const fallbackSources = [
        config.paths.frontend,
        config.paths.backend
      ].filter(Boolean) as string[];
      if (fallbackSources.length === 0) return log.info("No apps found, set config.paths.frontend or config.paths.backend");
      const choices = fallbackSources.flatMap((p) => new Dir(p).readDirs());
      const choice = await search({ choices: choices.map((p) => p.toChoice()), message: "Select project" });
      dirs = [choices.find((p) => p.toChoice().name === choice)!];
    }

    const source_branch = await input({ message: "Input source branch" });
    const target_branch = await input({ message: "Input target branch" });

    const bar = progressBar(dirs.length);
    const skipped: Dir[] = [];
    for (const d of dirs) {
      const ignores = Config.get().repos.merge?.ignores;
      if (ignores?.includes(d.name())) continue;
      const repo = new AppRepo(d);
      const { name } = await repo.getInfo();
      bar.setSufix(name);
      await repo.stash(async () => {
        const temporary_branch = `nivelacion/${source_branch}-${target_branch}`;
        await repo.update();
        if ((await repo.getBranches()).includes(temporary_branch)) {
          skipped.push(d);
          return;
        }
        const { original_branch } = await repo.switchBranchIfExists(target_branch);
        if (original_branch === temporary_branch) await repo.deleteBranch(temporary_branch);
        await repo.pull(target_branch);

        await repo.switchBranchIfExists(source_branch);
        await repo.pull(source_branch);

        await repo.createNewBranch(temporary_branch);
        await repo.createMr(target_branch, { title: `Nivelacion ${source_branch} - ${target_branch}` });
        const { switched } = await repo.switchBranchIfExists(original_branch);
        if (!switched) await repo.switchBranchIfExists("master");
        await repo.deleteBranch(temporary_branch);
      });
      bar.increment(1);
    }
    bar.stop();

    if (skipped.length > 0) {
      console.log("Skipped:");
      skipped.forEach((d) => console.log(d.path));
    }
  }
};
