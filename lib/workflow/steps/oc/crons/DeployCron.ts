import { CronYaml } from "@files/cron_yaml";
import { Dir } from "@files/dir";
import { Repo } from "@interface/dirs/repo";
import { ExecutionContext } from "@lib/ctx";
import { ConfigMap } from "@oc/configmap";
import { Secret } from "@oc/secret";

import { WorkflowStep } from "../..";

type Writes = {};
type Reads = {
  cron: CronYaml;
  schedule: string;
  version: string;
  secrets: Secret[];
  configmaps: ConfigMap[];
};
type Options = {};

export class DeployCron extends WorkflowStep<Reads, Writes, Options> {

  async run(ctx: ExecutionContext, {
    cron,
    schedule,
    version,
    secrets,
    configmaps
  }: Reads) {
    const name = cron.getName();
    const namespaces_path = ctx.config.paths.namespaces!;
    const repo = new Repo(new Dir(namespaces_path));
    await repo.stash(async () => {
      await repo.update();
      const { original_branch } = await repo.switchBranchIfExists("master");
      const temp_branch = `feature/update-cron-${name}`;
      await repo.createNewBranch(temp_branch);
      cron.setVersion(version);
      secrets.forEach((s) => cron.addSecret(s));
      configmaps.forEach((c) => cron.addConfigmap(c));
      cron.setSchedule(schedule);
      await repo.add(cron);
      const commit = await repo.commit(name);
      if (!commit) {
        console.log("No changes made");
        return;
      }
      await repo.createAndMergeMr("master");
      await repo.switchBranchIfExists("master");
      await repo.deleteBranch(temp_branch);
      await repo.switchBranchIfExists(original_branch);
    });
    return {};
  }
}
