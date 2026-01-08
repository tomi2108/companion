import { AppRepo } from "@interface/dirs/app_repo";
import { ExecutionContext } from "@lib/ctx";
import { PromptPaths } from "@steps/app/PromptPaths";
import { CopyEnv } from "@steps/env/CopyEnv";
import { PromptOcProject } from "@steps/oc/projects/PromptOcProject";
import { Spinner } from "@steps/ui/Spinner";
import { Workflow } from "@workflow/workflow";

export default {
  command: "copy",
  aliases: ["cp", "cpy"],
  describe: "Copy deployed environment to local repository",
  handler: async () => {
    const ctx = ExecutionContext.get();
    await new Workflow([
      new PromptPaths({
        paths: ["backend"],
        transform: ({ path }) => ({ app_repo: new AppRepo(path) })
      }),
      new PromptOcProject({ server: "cuyo" }),
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
