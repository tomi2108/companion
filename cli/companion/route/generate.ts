import { ExecutionContext } from "@lib/ctx";
import { filterFrontendDeployments } from "@oc/api";
import { Deployment } from "@oc/deployment";
import { ForEachStep } from "@steps/ForEach";
import { GetDeployments } from "@steps/oc/GetDeployments";
import { PromptOcProject } from "@steps/oc/PromptOcProject";
import { GenerateFrontendRoutes } from "@steps/routes/GenerateFrontendRoutes";
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
      // TODO[https://gitlab-ee.agil.movistar.com.ar/movar_app/tools/companion/-/issues/66]: backend routes
      new ForEachStep({
        item: "deployment",
        items: (state: { deployments: Deployment[] }) => state.deployments,
        step: new GenerateFrontendRoutes()
      })
    ]).run(ctx);
  }
};
