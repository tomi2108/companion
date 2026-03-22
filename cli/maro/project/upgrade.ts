import { Command } from "@lib/index";
import { filterFrontendDeployments } from "@oc/api";
import { Deployment } from "@oc/deployment";
import { DeployApp } from "@steps/app/DeployApp";
import { GetAppRepo } from "@steps/app/GetAppRepo";
import { GetAppLatestVersion } from "@steps/app/GetAppVersion";
import { GetDeployRepo } from "@steps/app/GetDeployRepo";
import { ForEach } from "@steps/flow/ForEach";
import { GetDeployments } from "@steps/oc/deployments/GetDeployments";
import { PromptOcProject } from "@steps/oc/projects/PromptOcProject";
import { PromptOcServer } from "@workflow/steps/oc/servers/PromptOcServer";
import { Workflow } from "@workflow/workflow";

const UpgradeCommand: Command = {
  name: "upgrade",
  aliases: ["up"],
  description: "Upgrade all apps to the latest version in a project",
  run: async ({ ctx }) => {
    await new Workflow([
      new PromptOcServer(),
      new PromptOcProject({
        transform: ({ project }) => ({ project, namespaces: [{ name: project.name, secrets: [], configmaps: [] }] })
      }),
      new GetDeployments({
        // TODO(20260318-002451): make this script also upgrade frontend deployments
        transform: ({ deployments }) => ({ deployments: deployments.filter((d) => !filterFrontendDeployments(d)) })
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

export default UpgradeCommand;
