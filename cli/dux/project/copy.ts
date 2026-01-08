import { DeployRepo } from "@interface/dirs/deploy_repo";
import { ExecutionContext } from "@lib/ctx";
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

export default {
  command: "copy",
  aliases: ["cp"],
  describe: "Copy all missing apps from one project to another",
  handler: async () => {
    const ctx = ExecutionContext.get();
    await new Workflow([
      new PromptOcProject({ server: "cuyo" }),
      new GetDeployments({ transform: ({ deployments }) => ({ from: deployments }) }),
      new PromptOcProject({ server: "cuyo" }),
      new GetDeployments({ transform: ({ deployments }) => ({ to: deployments }) }),
      new ForEach({
        concurrency: 10,
        items: ({ from, to }: { from: Deployment[]; to: Deployment[] }) =>
          arrayDifference(from, to, (d1, d2) => d1.name === d2.name)
            .filter((d) => !ctx.config?.project.copy?.exclusions?.includes(d.name)),
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
