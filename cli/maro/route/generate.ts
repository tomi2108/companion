import { Command } from "@lib/index";
import { filterFrontendDeployments } from "@oc/api";
import { Deployment } from "@oc/deployment";
import { ForEach } from "@steps/flow/ForEach";
import { GetDeployments } from "@steps/oc/deployments/GetDeployments";
import { PromptOcProject } from "@steps/oc/projects/PromptOcProject";
import { GenerateFrontendRoutes } from "@steps/routes/GenerateFrontendRoutes";
import { PromptOcServer } from "@workflow/steps/oc/servers/PromptOcServer";
import { Workflow } from "@workflow/workflow";

const GenerateCommand: Command = {
  name: "generate",
  description: "Generate OpenShift routes",
  run: async ({ ctx }) => {
    await new Workflow([
      new PromptOcServer(),
      new PromptOcProject(),
      new GetDeployments({
        transform: ({ deployments }) => ({ deployments: deployments.filter(filterFrontendDeployments) })
      }),
      // TODO(20260318-00246): backend routes
      new ForEach({
        item: "deployment",
        items: (state: { deployments: Deployment[] }) => state.deployments,
        step: new GenerateFrontendRoutes()
      })
    ]).run(ctx);
  }
};

export default GenerateCommand;
