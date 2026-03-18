import { CronYaml } from "@files/cron_yaml";
import { AppRepo } from "@interface/dirs/app_repo";
import { Dir } from "@interface/dirs/dir";
import { Repo } from "@interface/dirs/repo";
import { RepoWithGitProvider } from "@interface/dirs/withProvider";
import { Config } from "@lib/config";
import { ExecutionContext } from "@lib/ctx";
import { ConfigMap } from "@oc/configmap";
import { Project } from "@oc/project";
import { Secret } from "@oc/secret";

import { WorkflowStep } from "../..";

type Writes = {};
type Reads = {
  cron_name: string;
  app_repo: AppRepo;
  schedule: string;
  version: string;
  secrets: Secret[];
  configmaps: ConfigMap[];
  project: Project;
};
type Options = {};

export class CreateCron extends WorkflowStep<Reads, Writes, Options> {

  async run(ctx: ExecutionContext, {
    cron_name,
    schedule,
    version,
    secrets,
    configmaps,
    project,
    app_repo
  }: Reads) {
    const namespaces_path = Config.getView().get("paths.namespaces");
    const repo_path = new Dir(namespaces_path).sub(project.name);
    const cron_file = repo_path.sub("templates").createFile(`${cron_name}-cronjob.yaml`);
    const repo = new Repo(repo_path);
    await repo.stash(async () => {
      await repo.update();
      const { original_branch } = await repo.switchBranchIfExists("master");
      const temp_branch = `feature/add-cron-${cron_name}`;
      await repo.createNewBranch(temp_branch);
      const file = new CronYaml(cron_file.path);
      file.init();
      file.setVersion(version);
      file.setNameSpace(project.name);
      await file.setDeployment(app_repo);
      secrets.forEach((s) => file.addSecret(s));
      configmaps.forEach((c) => file.addConfigmap(c));
      file.setName(cron_name);
      file.setSchedule(schedule);
      await repo.add(cron_file);
      const commit = await repo.commit(cron_name);
      if (!commit) {
        console.log("No changes made");
        return;
      }
      await new RepoWithGitProvider(repo, ctx.gitProvider).createAndMergeMr("master");
      await repo.switchBranchIfExists("master");
      await repo.deleteBranch(temp_branch);
      await repo.switchBranchIfExists(original_branch);
    });
    return {};
  }
}
