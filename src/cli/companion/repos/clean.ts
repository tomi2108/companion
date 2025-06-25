import { readdirs } from "../../../lib/utils";
import { Config } from "../../../lib/config";
import { confirm, loading, progressBar, search } from "../../../lib/ui";
import path from "node:path";
import { Repo } from "../../../interface/files/repo";
import { Argv } from "yargs";
import log from "../../../lib/log";

export default {
  command: "clean",
  aliases: [],
  describe: "Clean repository",
  builder: (yargs: Argv) => yargs
    .boolean("all")
    .alias("all", ["a"])
    .describe("all", "Whether to clean all repositories at once"),
  // TODO: Add frontend and backend flags, look at 'repo level'
  handler: async ({ all }: { all?: boolean }) => {
    const paths = [
      ...readdirs(Config.get().paths.despliegues) ?? [],
      ...readdirs(Config.get().paths.frontend) ?? [],
      ...readdirs(Config.get().paths.backend) ?? []
    ];

    if (!all) {
      const choices = paths.map((p) => ({ name: path.join(p.path, p.name) }));

      const choice = await search({ choices, message: "Select project" });
      const repo = new Repo(choice);
      const { name } = await repo.getInfo();

      const sure = await confirm({ message: `Are you sure you want to clean ${name}` });
      if (!sure) return;

      const spinner = loading(`Cleaning ${name}`);
      await deleteBranches(repo);
      spinner.succeed(`Succesfully cleaned ${name}`);

    } else {
      const sure = await confirm({ message: "Are you sure you want to clean ALL repositories?" });
      if (!sure) return;

      const bar = progressBar(paths.length, 0, "cleaning");
      for (let index = 0; index < paths.length; index += 10) {
        const toClean = paths.slice(index, index + 10);
        await Promise.all(toClean.map(async (p) => {
          bar.setSufix(p.name);
          const repo = new Repo(path.join(p.path, p.name));
          await deleteBranches(repo);
          bar.increment(1);
        }
        ));
      }
      bar.stop();
      log.success("Succesfully cleaned all repositories");
    }
  }
};

async function deleteBranches(repo: Repo) {
  const to_delete = ["nivelacion", "feature", "bugfix", "hotfix", "fix", "despliegue"];

  await repo.stash(async () => {
    await repo.switchBranchIfExists("master");
    const branches = await repo.getBranches();
    for (const branch of branches) {
      if (to_delete.some((d) => branch.includes(d))) await repo.deleteBranch(branch);
    }
  });
}

