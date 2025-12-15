
import { DeployRepo } from "@interface/dirs/deploy_repo";
import { ExecutionContext } from "@lib/ctx";
import { search } from "@lib/ui";

import { WorkflowStep } from "..";

type Reads = { deploy_repo: DeployRepo };
type Writes = { namespaces: string[] };

export class PromptNamespaceDeploy implements WorkflowStep<Reads, Writes> {

  async run(_: ExecutionContext, { deploy_repo }: Reads) {
    await deploy_repo.update();
    const choices = deploy_repo.deployments.map((d) => d.toChoice());

    const choice = await search({ message: "Select environment", multiple: true, choices });
    if (choice.length === 0) return process.exit(1);

    return { namespaces: choice };
  }
}
