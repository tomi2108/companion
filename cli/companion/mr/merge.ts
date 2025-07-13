import { getApp } from "@files";
import { Repo } from "@files/repo";
import { promptForMr, promptForOcResource } from "@interface/prompts";
import log from "@lib/log";
import { confirm } from "@lib/ui";
import { getCurrentPath } from "@lib/utils";
import { findCIPipeline, getOcToken, Openshift, waitForPipeline } from "@oc";
import { PipelineStatus } from "@oc/pipelinerun";
import { Project } from "@oc/project";

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
    let deploy_projects: Project[] = [];

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

    const pipeline = await findCIPipeline(app_repo);
    if (!pipeline) {
      log.error("Could not find ci pipeline");
      return;
    }

    const status = await waitForPipeline(pipeline, "Running CI pipeline");
    if (status === PipelineStatus.failed) process.exit(1);

    await app_repo?.update();
    const last_version = (await app_repo.getTags({ sortByLastCreated: true }))?.[0];
    if (!last_version) {
      log.error("Could not find version to deploy");
      return;
    }
    deploy_repo.deploy(deploy_projects.map((p) => ({ configmaps: [], secrets: [], name: p.name })), last_version);
  }
};
