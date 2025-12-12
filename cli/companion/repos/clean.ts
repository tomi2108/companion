import { Dirent } from "node:fs";
import path from "node:path";
import { Argv } from "yargs";

import { Repo } from "@interface/dirs/repo";
import { Config } from "@lib/config";
import log from "@lib/log";
import { confirm, loading, progressBar, search } from "@lib/ui";
import { readdirs } from "@lib/utils";

export default {
  command: "clean",
  aliases: [],
  describe: "Clean repository",
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
    .boolean("despliegues")
    .alias("despliegues", ["d"])
    .describe("despliegues", "Whether to run the script for all despliegues repositories")
    .boolean("force")
    .describe("force", "Force clean")
    .conflicts("all", ["frontend", "backend", "despliegues"]),
  handler: async ({
    all,
    frontend,
    backend,
    despliegues,
    force
  }: {
    all?: boolean;
    frontend?: boolean;
    backend?: boolean;
    despliegues?: boolean;
    force?: boolean;
  }) => {
    let paths: Dirent[] = [];
    if (all || frontend) paths = [...paths, ...readdirs(Config.get().paths.frontend) ?? []];
    if (all || backend) paths = [...paths, ...readdirs(Config.get().paths.backend) ?? []];
    if (all || despliegues) paths = [...paths, ...readdirs(Config.get().paths.despliegues) ?? []];

    if (paths.length === 0) {
      const choices = [
        ...readdirs(Config.get().paths.frontend) ?? [],
        ...readdirs(Config.get().paths.backend) ?? [],
        ...readdirs(Config.get().paths.despliegues) ?? []
      ].map((p) => ({ name: path.join(p.parentPath, p.name) }));

      const choice = await search({ choices, message: "Select project" });
      const repo = new Repo(choice);
      const { name } = await repo.getInfo();

      const sure = await confirm({ message: `Are you sure you want to clean ${name}` });
      if (!sure) return;

      const spinner = loading(`Cleaning ${name}`);
      await deleteBranches(repo, force);
      spinner.succeed(`Succesfully cleaned ${name}`);
      return;
    }

    const sure = await confirm({ message: "Are you sure you want to clean repositories?" });
    if (!sure) return;

    const bar = progressBar(paths.length, 0, "cleaning");
    for (let index = 0; index < paths.length; index += 10) {
      const toClean = paths.slice(index, index + 10);
      await Promise.all(toClean.map(async (p) => {
        bar.setSufix(p.name);
        const repo = new Repo(path.join(p.parentPath, p.name));
        await deleteBranches(repo, force);
        bar.increment(1);
      }
      ));
    }
    bar.stop();
    log.success("Succesfully cleaned repositories");
  }
};

async function deleteBranches(repo: Repo, force?: boolean) {
  // TODO[https://gitlab-ee.agil.movistar.com.ar/movar_app/tools/companion/-/issues/75]: make a team , user overrideable config
  const to_delete = ["nivelacion", "feature", "bugfix", "hotfix", "fix", "despliegue", "bump"];
  if (force) await repo.reset();
  await repo.switchBranchIfExists("master");
  const branches = await repo.getBranches();
  for (const branch of branches) {
    if (to_delete.some((d) => branch.includes(d))) await repo.deleteBranch(branch);
  }
}

