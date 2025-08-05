import { Argv } from "yargs";

import { getApp } from "@files";
import { promptForOcResource } from "@interface/prompts";
import log from "@lib/log";
import { input, progressBar } from "@lib/ui";
import { Openshift } from "@oc";
import { filterFrontendDeployments, getOcToken } from "@oc/api";
import { Deployment } from "@oc/deployment";

export default {
  command: "install",
  aliases: [],
  describe: "Install/update dependencies",
  builder: (yargs: Argv) => yargs
    .boolean("dev")
    .alias("dev", ["d"])
    .describe("dev", "Install as dev dependency")
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
  handler: async ({ all, frontend, backend, dev }: {
    all?: boolean;
    frontend?: boolean;
    backend?: boolean;
    dev?: boolean;
  }) => {
    let toUpdate: Deployment[] = [];
    const projects = await new Openshift(await getOcToken()).getProjects();
    const project = await promptForOcResource(projects);
    const deployments = await project.getDeployments();

    if (all || frontend) toUpdate = [...toUpdate, ...deployments.filter(filterFrontendDeployments)];
    if (all || backend) toUpdate = [...toUpdate, ...deployments.filter((d) => !filterFrontendDeployments(d))];

    if (toUpdate.length === 0) {
      const choice = await promptForOcResource(deployments);
      toUpdate = [choice];
    }

    const name = await input({ message: "Enter dependency name" });
    const version = await input({ message: "Enter version" });
    const sourceBranch = await input({ message: "Source branch" });

    const bar = progressBar(toUpdate.length, 0, "Installing");

    for (let i = 0; i < toUpdate.length; i += 3) {
      const slice = toUpdate.slice(i, i + 3);
      await Promise.all(
        slice.map(async (d) => {
          bar.setSufix(d.name);
          const { app_repo } = await getApp(d.name);
          if (!app_repo) return log.warning(`Could not find app repo for ${d.name}, skipping`);
          await app_repo.stash(async () => {
            await app_repo.switchBranchIfExists(sourceBranch);
            const new_branch_name = `bump/${name}-${version}`;
            await app_repo.createNewBranch(new_branch_name);
            await app_repo.switchBranchIfExists(new_branch_name);
            await app_repo.install([{ name, version }], { dev });
            await app_repo.build();
            await app_repo.add("package.json");
            await app_repo.commit(`feat: bump ${name} to ${version}`);
            await app_repo.createAndMergeMr(sourceBranch);
            await app_repo.switchBranchIfExists(sourceBranch);
            await app_repo.deleteBranch(new_branch_name);
            bar.increment(1);
          });
        })
      );
    }
    bar.stop();
  }
};
