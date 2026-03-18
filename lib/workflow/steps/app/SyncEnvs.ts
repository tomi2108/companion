import { DeployYaml } from "@files/deploy_yaml";
import { DeployRepo } from "@interface/dirs/deploy_repo";
import { ExecutionContext } from "@lib/ctx";

import { WorkflowStep } from "..";

type Reads = {
  deploy_repo: DeployRepo;
  from: DeployYaml;
  to: DeployYaml;
};

type Writes = { branch: string };

export class SyncEnvs extends WorkflowStep<Reads, Writes> {
  async run(ctx: ExecutionContext, { deploy_repo, to, from }: Reads) {
    const branch = "feature/sync";
    deploy_repo.createNewBranch(branch);
    from.getSecrets().forEach((s) => to.setSecret(s));
    from.getConfigmaps().forEach((s) => to.setConfigMap(s));
    await deploy_repo.add(to);
    const commit = await deploy_repo.commit("sync envs");
    if (!commit) ctx.logger.warning("No changes made");
    return { branch };
  }
}
