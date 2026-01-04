import { ExecutionContext } from "@lib/ctx";
import { filterFrontendDeployments } from "@oc/api";
import { Deployment } from "@oc/deployment";
import { DeployApp } from "@workflow/steps/app/DeployApp";
import { GetAppRepo } from "@workflow/steps/app/GetAppRepo";
import { GetAppLatestVersion } from "@workflow/steps/app/GetAppVersion";
import { GetDeployRepo } from "@workflow/steps/app/GetDeployRepo";
import { ForEach } from "@workflow/steps/flow/ForEach";
import { GetDeployments } from "@workflow/steps/oc/deployments/GetDeployments";
import { PromptOcProject } from "@workflow/steps/oc/projects/PromptOcProject";
import { Workflow } from "@workflow/workflow";

export default {
  command: "upgrade",
  aliases: ["up"],
  describe: "Upgrade all apps to the latest version in a project",
  handler: async () => {
    const ctx = ExecutionContext.get();
    await new Workflow([
      new PromptOcProject({ server: "cuyo" }),
      new GetDeployments({
        // TODO[https://gitlab-ee.agil.movistar.com.ar/movar_app/tools/companion/-/issues/67]: make this script also upgrade frontend deployments
        transform: ({ deployments }) => ({ deployments: deployments.map((d) => !filterFrontendDeployments(d)) })
      }),
      new ForEach({
        item: "deployment",
        items: (state: { deployments: Deployment[] }) => state.deployments,
        concurrency: 10,
        step: new Workflow([
          new GetDeployRepo(),
          new GetAppRepo(),
          new GetAppLatestVersion(),
          new DeployApp()
        ])
      })
    ]).run(ctx);
  }
};
