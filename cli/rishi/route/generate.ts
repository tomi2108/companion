import { ExecutionContext } from "@lib/ctx";
import { filterFrontendDeployments } from "@oc/api";
import { Deployment } from "@oc/deployment";
import { GetDeployments } from "@workflow/steps/oc/deployments/GetDeployments";
import { PromptOcProject } from "@workflow/steps/oc/projects/PromptOcProject";
import { GenerateFrontendRoutes } from "@steps/routes/GenerateFrontendRoutes";
import { ForEach } from "@workflow/steps/flow/ForEach";
import { Workflow } from "@workflow/workflow";

export default {
  command: "generate",
  describe: "Generate OpenShift routes",
  handler: async () => {
    const ctx = ExecutionContext.get();
    new Workflow([
      new PromptOcProject({
        server: "cuyo"
      }),
      new GetDeployments({
        transform: ({ deployments }) => ({ deployments: deployments.filter(filterFrontendDeployments) })
      }),
      // TODO[https://gitlab-ee.agil.movistar.com.ar/movar_app/tools/rishi/-/issues/66]: backend routes
      new ForEach({
        item: "deployment",
        items: (state: { deployments: Deployment[] }) => state.deployments,
        step: new GenerateFrontendRoutes()
      })
    ]).run(ctx);
  }
};
