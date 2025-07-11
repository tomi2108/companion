import { setTimeout } from "node:timers/promises";
import { Repo } from "../../../interface/files/repo";
import { getOcToken, Openshift } from "../../../interface/oc/oc";
import { PipelineStatus } from "../../../interface/oc/pipelinerun";
import { Config } from "../../../lib/config";
import log from "../../../lib/log";
import { search, confirm, loading } from "../../../lib/ui";
import { getCurrentPath } from "../../../lib/utils";
import { getApp } from "../../../interface/files/files";
import { promptForOcResource } from "../../../interface/prompts";
import { Project } from "../../../interface/oc/project";

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
    const { name } = await repo.getInfo();

    const { deploy_repo, app_repo } = await getApp(name);
    let deploys = false;
    let deploy_projects: Project[] | null = null;

    if (app_repo && deploy_repo) {
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

    const token = await getOcToken("brc");
    const projects = await new Openshift(token, "brc").getProjects();

    const ci_paas = projects.find((p) => p.name === "ci-paas");
    if (!ci_paas) {
      log.error("Could not find cd-paas project");
      return;
    }

    const pipeline = await app_repo.findPipeline(ci_paas, "ci");

    if (!pipeline) {
      log.error("Could not find ci pipeline");
      return;
    }

    const spinner = loading("Running pipeline");
    while (await pipeline.status() === PipelineStatus.running) setTimeout(30 * 1000);

    const status = await pipeline.status();
    if (status === PipelineStatus.succeeded) {
      spinner.succeed("Pipeline succeeded");
      await app_repo?.update();
      const tags = await app_repo.getTags({ sortByLastCreated: true });
      const last_version = tags?.[0];
      if (!tags || !last_version) {
        log.error("Could not find version to deploy");
        return;
      }
      deploy_repo.deploy(projects.map((p) => ({ configmaps: [], secrets: [], name: p.name })), last_version);
    } else spinner.fail("Pipeline failed");
  }
};
