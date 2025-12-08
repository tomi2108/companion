import { getApp } from "@files";
import { AppRepo } from "@interface/dirs/app_repo";
import { Repo } from "@interface/dirs/repo";
import { promptForOcResource } from "@interface/prompts";
import { Config } from "@lib/config";
import log from "@lib/log";
import { confirm, loading, search } from "@lib/ui";
import { getCurrentPath } from "@lib/utils";
import { Openshift } from "@oc";
import { getOcToken } from "@oc/api";
import { PipelineStatus } from "@oc/pipelinerun";
import { Project } from "@oc/project";
import { findCIPipeline, waitForPipeline } from "@oc/utils";

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
    let merge = false;
    let deploys = false;
    let deploy_projects: Project[] = [];
    if (!add_reviewer) merge = await confirm({ message: "Merge?" });

    const { name } = await repo.getInfo();
    const { deploy_repo, app_repo } = await getApp(name);
    if (merge && AppRepo.isAppRepo(full_path)) {
      deploys = await confirm({ message: "Deploy?" });
      if (deploys) {
        const token = await getOcToken();
        const projects = await new Openshift(token).getProjects();
        deploy_projects = await promptForOcResource(projects, { message: "Choose projects", multiple: true });
      }
    }

    if (!merge) {
      const spinner = loading("Building merge request");
      const mr = await repo.createMr(targetBranch, { reviewer: add_reviewer ? default_reviewer : undefined });
      spinner.succeed();
      const open = await confirm({ message: `Open ${mr.title} in browser?` });
      if (open) return mr.openInBrowser();
    }

    await repo.createAndMergeMr(targetBranch);

    if (!deploys || !app_repo || !deploy_repo || deploy_projects?.length === 0) return;

    const pipeline = await findCIPipeline(app_repo);
    if (!pipeline) return log.error("Could not find ci pipeline");
    const status = await waitForPipeline(pipeline, "Running CI pipeline");
    if (status === PipelineStatus.failed) process.exit(1);

    await app_repo?.update();
    const tags = await app_repo.getTags({ sortByLastCreated: true });
    const last_version = tags?.[0];
    if (!tags || !last_version) return log.error("Could not find version to deploy");

    deploy_repo.deploy(deploy_projects.map((p) => ({ configmaps: [], secrets: [], name: p.name })), last_version);
  }
};
