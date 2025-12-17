
import { DeployYaml } from "@files/deploy_yaml";
import { DeployRepo } from "@interface/dirs/deploy_repo";
import { promptChoice } from "@interface/prompts";
import { ExecutionContext } from "@lib/ctx";

import { WorkflowStep } from "..";

type Reads = { deploy_repo: DeployRepo };
type Writes = { deploy_yamls: DeployYaml[] };

export class PromptNamespaceDeploy extends WorkflowStep<Reads, Writes> {

  async run(_: ExecutionContext, { deploy_repo }: Reads) {
    await deploy_repo.update();
    const choice = await promptChoice(
      deploy_repo.deployments, { message: "Select environment", multiple: true }
    );

    return { deploy_yamls: choice };
  }
}
