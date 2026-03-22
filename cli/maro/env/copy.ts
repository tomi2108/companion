import { AppRepo } from "@interface/dirs/app_repo";
import { Command } from "@lib/index";
import { PromptPaths } from "@steps/app/PromptPaths";
import { CopyEnv } from "@steps/env/CopyEnv";
import { PromptOcProject } from "@steps/oc/projects/PromptOcProject";
import { Spinner } from "@steps/ui/Spinner";
import { PromptOcServer } from "@workflow/steps/oc/servers/PromptOcServer";
import { Workflow } from "@workflow/workflow";

const CopyEnvCommand: Command = {
  name: "copy",
  aliases: ["cp", "cpy"],
  description: "Copy deployed environment to local repository",
  run: async ({ ctx }) => {
    await new Workflow([
      new PromptPaths({
        paths: ["backend"],
        transform: ({ path }) => ({ app_repo: new AppRepo(path) })
      }),
      new PromptOcServer(),
      new PromptOcProject(),
      new Spinner({
        step: new CopyEnv(),
        message: async ({ app_repo, project }) => {
          const { name } = await app_repo.getInfo();
          return `Copying envs for ${name} from ${project.name}`;
        }
      })
    ]).run(ctx);
  }
};

export default CopyEnvCommand;
