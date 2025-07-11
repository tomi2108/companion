import { promptForMr, promptForOcResource } from "../../../interface/prompts";
import { Repo } from "../../../interface/files/repo";
import { getCurrentPath } from "../../../lib/utils";
import { getOcToken, Openshift } from "../../../interface/oc/oc";
import log from "../../../lib/log";
import { confirm, loading } from "../../../lib/ui";
import { getApp } from "../../../interface/files/files";
import { PipelineStatus } from "../../../interface/oc/pipelinerun";
import { setTimeout } from "node:timers/promises";
import { Project } from "../../../interface/oc/project";

export default {
  command: "merge",
  aliases: [],
  describe: "Merge merge request",
  handler: async () => {
    const full_path = getCurrentPath();
    const repo = new Repo(full_path);
    const mr = await promptForMr(repo);
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

    await mr.merge();

    if (!deploys || !app_repo || !deploy_repo || deploy_projects?.length === 0) return;

    const token = await getOcToken("brc");
    const projects = await new Openshift(token, "brc").getProjects();

    const project = projects.find((p) => p.name === "ci-paas");
    if (!project) {
      log.error("Could not find cd-paas project");
      return;
    }

    const pipeline = await app_repo.findPipeline(project, "ci");

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
