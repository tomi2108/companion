import { AppRepo } from "@interface/dirs/app_repo";
import { ExecutionContext } from "@lib/ctx";
import { Project } from "@oc/project";

import { WorkflowStep } from "..";

type Reads = {
  app_repo: AppRepo;
  version: string;
  project: Project;
};

export class CreateApp extends WorkflowStep<Reads> {

  async run(ctx: ExecutionContext, { app_repo, version, project }: Reads) {
    const { name } = await app_repo.getInfo();
    const issueProvider = ctx.gitProvider.issues;
    await issueProvider.createArgoIssue(name, version, project);
    return {};
  }
}
