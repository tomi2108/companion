import { DeployRepo } from "@interface/dirs/deploy_repo";
import { Config } from "@lib/config";
import { Command } from "@lib/index";
import { arrayDifference } from "@lib/utils";
import { Deployment } from "@oc/deployment";
import { Project } from "@oc/project";
import { CreateApp } from "@steps/app/CreateApp";
import { GetAppRepo } from "@steps/app/GetAppRepo";
import { GetDeployRepo } from "@steps/app/GetDeployRepo";
import { ForEach } from "@steps/flow/ForEach";
import { Write } from "@steps/flow/Write";
import { GetDeployments } from "@steps/oc/deployments/GetDeployments";
import { PromptOcProject } from "@steps/oc/projects/PromptOcProject";
import { Workflow } from "@workflow/workflow";

const CopyCommand: Command = {
  name: "copy",
  aliases: ["cp"],
  description: "Copy all missing apps from one project to another",
  run: async ({ ctx }) => {
    const config = Config.getView();
    await new Workflow([
      new PromptOcProject({ server: "cuyo", transform: ({ project }) => ({ from: project, project }) }),
      new GetDeployments({ transform: ({ deployments }) => ({ from_deployments: deployments }) }),
      new PromptOcProject({ server: "cuyo", transform: ({ project }) => ({ to: project, project }) }),
      new GetDeployments({ transform: ({ deployments }) => ({ to_deployments: deployments }) }),
      new ForEach({
        concurrency: 10,
        items: ({ from_deployments, to_deployments }: { from_deployments: Deployment[]; to_deployments: Deployment[] }) =>
          arrayDifference(from_deployments, to_deployments, (d1, d2) => d1.name === d2.name)
            .filter((d) => !config.get("project.copy.exclusions").includes(d.name)),
        item: "deployment",
        step: new Workflow([
          new GetDeployRepo(),
          new GetAppRepo(),
          new Write({
            write: ({ deploy_repo, to, from }: {
              deploy_repo: DeployRepo;
              to: Project;
              from: Project;
            }) => ({
              project: to,
              version: deploy_repo.getDeployment(from.name)?.getVersion()
            })
          }),
          new CreateApp()
        ])
      })
    ]).run(ctx);
  }
};

export default CopyCommand;
