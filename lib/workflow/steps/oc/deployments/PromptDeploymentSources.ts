import { ExecutionContext } from "@lib/ctx";
import { filterFrontendDeployments } from "@oc/api";
import { Deployment } from "@oc/deployment";
import { PromptSources } from "@steps/repos/PromptSources";
import { WorkflowOptions } from "@workflow/steps";

type Reads = { deployments: Deployment[] };
type Writes = {};
type Options = {
  frontend?: boolean;
  backend?: boolean;
};

export class PromptDeploymentSources extends PromptSources<(d: Deployment) => boolean, Deployment, "deployments", Reads> {
  key = "deployments" as const;

  constructor({ frontend, backend }: WorkflowOptions<Options, Writes>) {
    const sources = [
      { enabled: Boolean(frontend), source: filterFrontendDeployments },
      { enabled: Boolean(backend), source: (d: Deployment) => !filterFrontendDeployments(d) }
    ];
    super({ sources });
  }

  protected override transform(sources: ((d: Deployment) => boolean)[], { deployments }: Reads): Deployment[] {
    return sources.flatMap((f) => deployments.filter(f));
  }

  async promptSingle(ctx: ExecutionContext, { deployments }: Reads) {
    const deployment = await ctx.ui.promptChoice(deployments);
    return deployment;
  }

}
