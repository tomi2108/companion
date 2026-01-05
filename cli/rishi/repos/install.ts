import { Argv } from "yargs";

import { AppRepo } from "@interface/dirs/app_repo";
import { ExecutionContext } from "@lib/ctx";
import { confirm } from "@lib/ui";
import { PromptSources } from "@steps/repos/PromptSources";
import { Input } from "@steps/ui/Input";
import { ForEach } from "@workflow/steps/flow/ForEach";
import { Write } from "@workflow/steps/flow/Write";
import { Workflow } from "@workflow/workflow";

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
    // TODO: add  loading
    const ctx = ExecutionContext.get();
    await new Workflow([
      new PromptSources({
        sources: [
          { enabled: Boolean(all || frontend), path: "frontend" },
          { enabled: Boolean(all || backend), path: "backend" }
        ],
        transform: ({ dirs }) => ({ app_repos: dirs.map((dir) => new AppRepo(dir)) })
      }),
      new Input({ message: "Enter dependecy name", write: "dependency" }),
      new Input({ message: "Enter version", write: "version" }),
      new Input({ message: "Source branch", write: "source_branch" }),
      new Write({
        write: () => ({ merge: confirm({ message: "Merge?" }) })
      }),
      new ForEach({
        concurrency: 4,
        item: "app_repo",
        items: (state: { app_repos: AppRepo[] }) => state.app_repos,
        // TODO: implement
        step: new RepoInstall({ dev })
      })
    ]).run(ctx);

    // for (let i = 0; i < toUpdate.length; i += 4) {
    //   const slice = toUpdate.slice(i, i + 3);
    //   await Promise.all(
    //     slice.map(async (d) => {
    //       const { app_repo } = await getApp(d.name);
    //       if (!app_repo) return log.warning(`Could not find app repo for ${d.name}, skipping`);
    //       await app_repo.stash(async () => {
    //         await app_repo.switchBranchIfExists(sourceBranch);
    //         await app_repo.pull(sourceBranch);
    //         const new_branch_name = `bump/${name}-${version}`;
    //         if ((await app_repo.getBranches()).some((b) => b.includes(new_branch_name))) return bar.increment(1);
    //         await app_repo.createNewBranch(new_branch_name);
    //         const repo_package = app_repo.getPackage();
    //         const dependencies = dev
    //           ? repo_package.devDependencies
    //           : { ...repo_package.dependencies, ...repo_package.peerDependencies };
    //         const current_version = dependencies?.[name];
    //         if (current_version && current_version.includes(version)) return bar.increment(1);
    //         await app_repo.install([{ name, version }], { dev });
    //         await app_repo.build();
    //         await app_repo.add(app_repo.package);
    //         await app_repo.commit(`feat: bump ${name} to ${version}`);
    //         if (merge) await app_repo.createAndMergeMr(sourceBranch);
    //         else await app_repo.createMr(sourceBranch);
    //         await app_repo.switchBranchIfExists(sourceBranch);
    //         await app_repo.deleteBranch(new_branch_name);
    //       });
    //     })
    //   );
    // }
  }
};
