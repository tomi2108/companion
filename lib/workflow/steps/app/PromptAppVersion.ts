import { AppRepo } from "@interface/dirs/app_repo";
import { ExecutionContext } from "@lib/ctx";
import { input, loading, search } from "@lib/ui";

import { WorkflowStep } from "..";

type Reads = { app_repo: AppRepo | null };
type Writes = { version: string };

export class PromptAppVersion extends WorkflowStep<Reads, Writes> {

  async run(ctx: ExecutionContext, { app_repo }: Reads) {
    const logger = ctx.logger;
    const spinner = loading("Getting versions");
    let version = null;
    if (app_repo) {
      const tags = await app_repo.getTags();
      spinner.succeed();
      version = await search({ choices: tags, message: "Choose a version:" });
    } else {
      spinner.fail();
      logger.warning("Tags not found");
      version = await input({ message: "Enter version, starting with a 'v':" });
    }

    return { version };
  }
}
