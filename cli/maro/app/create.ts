import { AppRepo } from "@interface/dirs/app_repo";
import { DeployRepo } from "@interface/dirs/deploy_repo";
import { Command } from "@lib/index";
import { CreateApp } from "@workflow/steps/app/CreateApp";
import { GetDeployRepo } from "@workflow/steps/app/GetDeployRepo";
import { PromptAppVersion } from "@workflow/steps/app/PromptAppVersion";
import { PromptPaths } from "@workflow/steps/app/PromptPaths";
import { PromptOcProject } from "@workflow/steps/oc/projects/PromptOcProject";
import { PromptOcServer } from "@workflow/steps/oc/servers/PromptOcServer";
import { Workflow } from "@workflow/workflow";

const CreateCommand: Command = {
  name: "create",
  aliases: ["c"],
  description: "Create GitLab issues for app deployment",
  run: ({ ctx }) => {
    new Workflow([
      new PromptOcServer(),
      new PromptPaths({
        paths: ["backend", "frontend"],
        transform: ({ path }) => ({ app_repo: new AppRepo(path) })
      }),
      new GetDeployRepo({ throw: false }),
      new PromptOcProject<{ deploy_repo?: DeployRepo }>({
        filter: (project, { deploy_repo }) =>
          !deploy_repo?.deployments.map((d) => d.namespace).includes(project.name)
      }),
      new PromptAppVersion(),
      new CreateApp()
    ]).run(ctx);
  }
};

export default CreateCommand;
