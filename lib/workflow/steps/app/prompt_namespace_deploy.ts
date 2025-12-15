
import { DeployRepo } from "@interface/dirs/deploy_repo";
import { ExecutionContext } from "@lib/ctx";
import { search } from "@lib/ui";

import { WorkflowStep } from "..";

type In = { deploy_repo: DeployRepo };
type Out = string[];

export class PromptNamespaceDeploy implements WorkflowStep<In, Out> {

  async run(_: ExecutionContext, { deploy_repo }: In) {
    await deploy_repo.update();
    const choices = deploy_repo.deployments.map((d) => d.toChoice());

    const selectedNamespaces = await search({ message: "Select environment", multiple: true, choices });
    if (selectedNamespaces.length === 0) return process.exit(1);

    return selectedNamespaces;
  }
}
