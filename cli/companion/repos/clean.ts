import { Argv } from "yargs";

import { Repo } from "@interface/dirs/repo";
import { promptSourcesOrOne } from "@interface/prompts";
import { Config } from "@lib/config";
import log from "@lib/log";
import { confirm, progressBar } from "@lib/ui";

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
    const config = Config.get();
    const dirs = await promptSourcesOrOne([
      { enabled: Boolean(all || frontend), path: config.paths.frontend },
      { enabled: Boolean(all || backend), path: config.paths.backend },
      { enabled: Boolean(all || despliegues), path: config.paths.despliegues }
    ]);

    if (!dirs) return log.info("No apps found, set config.paths.frontend or config.paths.backend");

    const sure = await confirm({ message: "Are you sure you want to clean repositories?" });
    if (!sure) return;

    const bar = progressBar(dirs.length, 0, "cleaning");
    for (let index = 0; index < dirs.length; index += 10) {
      const toClean = dirs.slice(index, index + 10);
      await Promise.all(
        toClean.map(async (dir) => {
          bar.setSufix(dir.name());
          const repo = new Repo(dir);
          await deleteBranches(repo, force);
          bar.increment(1);
        })
      );
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

