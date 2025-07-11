import { setTimeout } from "node:timers/promises";
import { AppRepo } from "../../../interface/files/app_repo";
import { Repo } from "../../../interface/files/repo";
import { getOcToken, Openshift } from "../../../interface/oc/oc";
import { PipelineStatus } from "../../../interface/oc/pipelinerun";
import { Config } from "../../../lib/config";
import log from "../../../lib/log";
import { search, confirm, loading } from "../../../lib/ui";
import { getCurrentPath } from "../../../lib/utils";

export default {
  command: "create",
  aliases: [],
  describe: "Create and merge mr",
  handler: async () => {
    const full_path = getCurrentPath();
    const repo = new Repo(full_path);
    const branches = await repo.getBranches();
    const activeBranch = await repo.getActiveBranch();
    const targetBranches = branches.filter((b) => b !== activeBranch);
    const targetBranch = await search({ choices: targetBranches, message: "Choose target branch" });
    const default_reviewer = Config.get().gitlab.default_reviewer;
    const add_reviewer = await confirm({ initial: false, message: `Add default reviewer? (${default_reviewer})` });
    const merge = await confirm({ message: "Merge?" });
    let app_repo: AppRepo | null = null;
    try {
      app_repo = new AppRepo(repo.full_path);
    } catch {
      app_repo = null;
    }

    let deploys = false;
    if (app_repo) {
      deploys = await confirm({ message: "Deploy?" });
    }

    if (!merge) {
      const spinner = loading("Building merge request");
      const mr = await repo.createMr(targetBranch, { reviewer: add_reviewer ? default_reviewer : undefined });
      spinner.succeed();
      const open = await confirm({ message: `Open ${mr.title} in browser?` });
      if (open) return mr.openInBrowser();
    }

    await repo.createAndMergeMr(targetBranch);

    if (!deploys) return;

    const token = await getOcToken("brc");
    const projects = await new Openshift(token, "brc").getProjects();

    const project = projects.find((p) => p.name === "ci-paas");
    if (!project) {
      log.error("Could not find cd-paas project");
      return;
    }

    const pipeline = await app_repo?.findPipeline(project, "ci");

    if (!pipeline) {
      log.error("Could not find ci pipeline");
      return;
    }

    const spinner = loading("Running pipeline");
    while (await pipeline.status() === PipelineStatus.running) setTimeout(30 * 1000);

    const status = await pipeline.status();
    console.log(status);
    if (status === PipelineStatus.succeeded) spinner.succeed("Pipeline succeeded");
    else spinner.fail("Pipeline failed");
  }
};
